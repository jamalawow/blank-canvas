import { GoogleGenAI, Type } from "@google/genai";
import { MasterProfile } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize only if key exists to avoid immediate errors, though usage will fail if missing
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Helper to ensure data integrity from AI responses
const sanitizeParsedProfile = (data: any): Partial<MasterProfile> => {
    if (!data || typeof data !== 'object') return {};
    
    // Ensure experiences is an array
    const experiences = Array.isArray(data.experiences) ? data.experiences : [];

    // Sanitize each experience
    const sanitizedExperiences = experiences.map((exp: any) => ({
        ...exp,
        id: exp.id || `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        company: exp.company || "Unknown Company",
        role: exp.role || "Unknown Role",
        startDate: exp.startDate || "",
        endDate: exp.endDate || "",
        location: exp.location || "",
        // Ensure bullets is an array and content is a string
        bullets: Array.isArray(exp.bullets) ? exp.bullets.map((b: any) => ({
            ...b,
            id: b.id || `b-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            content: b.content || "", // Ensure content exists
            isLocked: !!b.isLocked,
            isVisible: b.isVisible !== false
        })) : []
    }));

    return {
        ...data,
        experiences: sanitizedExperiences
    };
};

export const optimizeBulletPoint = async (bullet: string, jobContext: string = ''): Promise<string> => {
  if (!ai) {
    console.warn("No API Key found");
    return bullet; 
  }

  try {
    const prompt = `
      You are a Ruthless Hiring Manager. You hate "fluff". You reject generic AI adjectives.
      
      Task: Rewrite the following resume bullet point.
      
      Negative Constraints: NEVER use words like "spearheaded", "orchestrated", "leveraged", "crucial", "visionary", "comprehensive", "synergy".
      Positive Constraints: Use active verbs (e.g., "Built", "Audited", "Reduced", "Negotiated").
      Goal: Use quantifiable metrics if possible, or make the outcome very concrete.
      
      Context (Job Description excerpt): ${jobContext.slice(0, 300)}...
      
      Original Bullet: "${bullet}"
      
      Return ONLY the rewritten bullet point text. No explanations.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || bullet;
  } catch (error) {
    console.error("Gemini optimization failed:", error);
    return bullet;
  }
};

export const analyzeJobDescription = async (jdText: string): Promise<string[]> => {
    if (!ai) return [];
    
    try {
        const prompt = `
            Extract the top 5 most important technical skills or hard requirements from this Job Description.
            Return them as a JSON array of strings.
            
            Job Description:
            ${jdText.slice(0, 2000)}
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });
        
        const text = response.text;
        if (!text) return [];
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to analyze JD", e);
        return [];
    }
}

export interface BulletScore {
  id: string;
  score: number;
  reason: string;
}

export const scoreSingleBullet = async (id: string, content: string, jdText: string): Promise<BulletScore | null> => {
    if (!ai) return null;
    
    try {
        const prompt = `
            Rate the relevance of this single resume bullet point against the Job Description.
            
            Job Description Excerpt:
            ${jdText.slice(0, 1000)}
            
            Bullet: "${content}"
            
            Return JSON object: { "id": "${id}", "score": number (0-100), "reason": string (short) }
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        score: { type: Type.INTEGER },
                        reason: { type: Type.STRING }
                    },
                    required: ["id", "score", "reason"]
                }
            }
        });
        
        const text = response.text;
        if (!text) return null;
        return JSON.parse(text);
    } catch (e) {
        console.error("Single score failed", e);
        return null;
    }
}

export const scoreBulletsRelevance = async (bullets: {id: string, content: string}[], jdText: string): Promise<BulletScore[]> => {
  if (!ai) return bullets.map(b => ({ id: b.id, score: 50, reason: "No API Key" }));

  try {
    // We batch the bullets to save tokens and context
    const bulletList = bullets.map(b => `ID: ${b.id}\nContent: ${b.content}`).join("\n\n");

    const prompt = `
      You are a strict recruiter. Rate the relevance of the following resume bullet points against the provided Job Description.
      
      Job Description Excerpt:
      ${jdText.slice(0, 1500)}
      
      Resume Bullets:
      ${bulletList}
      
      Instructions:
      1. Rate each bullet from 0 to 100 based on how strongly it proves the candidate can do the specific job described.
      2. 0 = Irrelevant fluff. 100 = Perfect match for a core requirement.
      3. Provide a very brief (3-5 words) reason for the score.
      
      Return JSON array of objects with keys: "id", "score" (number), "reason" (string).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              score: { type: Type.INTEGER },
              reason: { type: Type.STRING }
            },
            required: ["id", "score", "reason"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    // Robust parsing: handle top-level array or wrapped object
    try {
        const result = JSON.parse(text);
        if (Array.isArray(result)) return result;
        // Fallback if model wraps it in { "items": [...] } or similar
        if (typeof result === 'object' && result !== null) {
             const possibleArray = Object.values(result).find(val => Array.isArray(val));
             if (possibleArray) return possibleArray as BulletScore[];
        }
        return [];
    } catch (e) {
        console.error("JSON parse error in scoring", e);
        return [];
    }

  } catch (error) {
    console.error("Scoring failed:", error);
    return [];
  }
};

const RESUME_PARSING_PROMPT = `
You are a Data Entry Specialist converting a resume into a structured JSON format.

Instructions:
1. Extract the candidate's name, email, phone, location, linkedin, and summary.
2. Extract "experiences" as an array.
3. For each experience, extract company, role, dates (start/end), location.
4. Crucial: Split the description into atomic "bullets". Each bullet is a string.
5. Generate unique IDs (e.g., "exp-1", "b-1") for everything.

Return JSON matching this schema exactly:
{
    "name": string,
    "email": string,
    "phone": string,
    "location": string, // Extract city/state if found
    "linkedin": string,
    "summary": string,
    "experiences": [
        {
            "id": string,
            "company": string,
            "role": string,
            "startDate": string,
            "endDate": string,
            "location": string,
            "bullets": [
                { "id": string, "content": string, "isLocked": false, "isVisible": true }
            ]
        }
    ]
}
`;

export const parseResumeFromText = async (rawText: string): Promise<Partial<MasterProfile>> => {
    if (!ai) return {};

    try {
        const prompt = `
            ${RESUME_PARSING_PROMPT}
            
            Input Text:
            ${rawText.slice(0, 8000)}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        const text = response.text;
        if (!text) return {};
        try {
            return sanitizeParsedProfile(JSON.parse(text));
        } catch(e) { console.error("JSON parse error", e); return {}; }
    } catch (e) {
        console.error("Failed to parse resume text", e);
        return {};
    }
}

export const parseResumeFromPdf = async (base64Data: string): Promise<Partial<MasterProfile>> => {
    if (!ai) return {};

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: 'application/pdf',
                            data: base64Data
                        }
                    },
                    {
                        text: RESUME_PARSING_PROMPT
                    }
                ]
            },
            config: {
                responseMimeType: "application/json"
            }
        });

        const text = response.text;
        if (!text) return {};
        try {
            return sanitizeParsedProfile(JSON.parse(text));
        } catch(e) { console.error("JSON parse error", e); return {}; }
    } catch (e) {
        console.error("Failed to parse resume PDF", e);
        return {};
    }
}

export interface GapAnalysis {
    missingSkills: string[];
    presentSkills: string[];
}

export const analyzeJobGaps = async (profileText: string, jdText: string): Promise<GapAnalysis> => {
    if (!ai) return { missingSkills: [], presentSkills: [] };

    try {
        const prompt = `
            Perform a gap analysis between a candidate's resume and a job description.
            
            Resume Content:
            ${profileText.slice(0, 4000)}
            
            Job Description:
            ${jdText.slice(0, 2000)}
            
            Instructions:
            1. Identify the top 5 hard skills or technologies required by the JD that are COMPLETELY MISSING or barely mentioned in the Resume.
            2. Also list top skills that ARE present.
            
            Return JSON:
            {
                "missingSkills": string[],
                "presentSkills": string[]
            }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        const text = response.text;
        if (!text) return { missingSkills: [], presentSkills: [] };
        
        try {
            const json = JSON.parse(text);
            return {
                missingSkills: Array.isArray(json.missingSkills) ? json.missingSkills : [],
                presentSkills: Array.isArray(json.presentSkills) ? json.presentSkills : []
            };
        } catch (e) { return { missingSkills: [], presentSkills: [] }; }
    } catch (e) {
        console.error("Gap analysis failed", e);
        return { missingSkills: [], presentSkills: [] };
    }
}

export const generateBridgingBullet = async (skill: string, userContext: string, jobContext: string): Promise<string> => {
    if (!ai) return `Experience with ${skill}`;

    try {
         const prompt = `
            You are a Resume Strategist. The user has experience with "${skill}" but forgot to put it on their resume. 
            The Job Description requires it.
            
            User's rough context: "${userContext}"
            Target Job Context: "${jobContext.slice(0, 500)}"
            
            Task: Write ONE high-impact, metric-driven bullet point proving they have this skill.
            Style: Active verbs, no fluff, "Ruthless Hiring Manager" approved.
            
            Return ONLY the bullet text.
         `;

         const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
    
        return response.text?.trim() || "";
    } catch (e) {
        console.error("Bridge generation failed", e);
        return "";
    }
}

export const generateCoverLetter = async (profile: MasterProfile, jobTitle: string, company: string, jdText: string): Promise<string> => {
    if (!ai) return "";

    try {
        // Prepare context
        const experienceSummary = profile.experiences.slice(0, 3).map(e => `${e.role} at ${e.company} (${e.bullets.length} achievements)`).join(", ");
        
        const prompt = `
            You are the candidate, ${profile.name}. Write a persuasive Cover Letter for the position of "${jobTitle}" at "${company}".
            
            Job Description:
            ${jdText.slice(0, 1500)}
            
            My Background:
            Summary: ${profile.summary}
            History: ${experienceSummary}
            
            Rules:
            1. NO Placeholder text like [Your Name]. Use the real name: ${profile.name}.
            2. Address it to "Dear Hiring Manager," if no name is found.
            3. Structure:
               - Hook: Why this specific role/company? (Infer from JD).
               - The Proof: Connect 2-3 key skills from my summary to their needs.
               - Closing: Confident call to action.
            4. Tone: Professional, confident, but NOT arrogant. NO FLUFF.
            5. Length: 3 paragraphs max.
            
            Return the full letter text only.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        return response.text?.trim() || "";
    } catch (e) {
        console.error("Cover letter generation failed", e);
        return "Error generating cover letter. Please try again.";
    }
}


export interface BulletPoint {
  id: string;
  content: string;
  isLocked: boolean; // If true, don't auto-optimize
  metrics?: string[]; // Detected metrics
  isVisible?: boolean; // Controls inclusion in the final PDF
  relevanceScore?: number; // 0-100 score against current JD
  relevanceReason?: string; // Short justification for the score
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string | 'Present';
  location: string;
  bullets: BulletPoint[];
}

export interface MasterProfile {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  summary: string;
  experiences: ExperienceEntry[];
}

export interface JobDescription {
  id: string;
  company: string;
  title: string;
  text: string;
  keywords: string[];
}

export interface ResumeSnapshot {
  id: string;
  timestamp: number;
  jobTitle: string;
  company: string;
  profileSnapshot: MasterProfile;
  jobSnapshot: JobDescription;
  coverLetter?: string; // New field
}

export enum AppView {
  MASTER_PROFILE = 'MASTER_PROFILE',
  JOB_MATCH = 'JOB_MATCH',
  COVER_LETTER = 'COVER_LETTER',
  PREVIEW = 'PREVIEW',
  BACKEND_SPEC = 'BACKEND_SPEC',
  HISTORY = 'HISTORY'
}

export const INITIAL_PROFILE: MasterProfile = {
  name: "Alex Mercer",
  email: "alex.mercer@example.com",
  phone: "555-0199",
  linkedin: "linkedin.com/in/alexmercer",
  summary: "Senior Backend Engineer focused on scalable architecture and data consistency. Proven track record of reducing latency and optimizing database queries in high-throughput environments.",
  experiences: [
    {
      id: "1",
      company: "FinTech Global",
      role: "Senior Python Developer",
      startDate: "2021-03",
      endDate: "Present",
      location: "New York, NY",
      bullets: [
        { id: "b1", content: "Utilized advanced methodologies to comprehensively audit the financial systems, ensuring total accuracy.", isLocked: false, isVisible: true },
        { id: "b2", content: "Directed a team of 4 analysts to automate monthly reporting, saving 12 hours per week.", isLocked: false, isVisible: true },
        { id: "b3", content: "Refactored legacy codebase to improve maintainability and reduce technical debt.", isLocked: false, isVisible: true }
      ]
    },
    {
      id: "2",
      company: "DataCorp Solutions",
      role: "Software Engineer",
      startDate: "2018-06",
      endDate: "2021-02",
      location: "Remote",
      bullets: [
        { id: "b4", content: "Spearheaded the migration of on-premise servers to AWS, achieving great synergy.", isLocked: false, isVisible: true },
        { id: "b5", content: "Built internal tooling for data processing using Python and Pandas.", isLocked: false, isVisible: true }
      ]
    }
  ]
};

export const PYTHON_BACKEND_SCRIPT = `import sys
from datetime import datetime
from typing import List, Optional

from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Text, Boolean, DateTime
from sqlalchemy.orm import  declarative_base, sessionmaker, relationship, Mapped
from jinja2 import Environment, FileSystemLoader, select_autoescape
from weasyprint import HTML, CSS

# --- 1. Database Configuration ---
Base = declarative_base()

class MasterEntry(Base):
    __tablename__ = 'master_entries'
    
    id = Column(Integer, primary_key=True)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)
    location = Column(String)
    
    # Relationship to bullets
    bullets = relationship("BulletPoint", back_populates="entry", cascade="all, delete-orphan")

class BulletPoint(Base):
    __tablename__ = 'bullet_points'
    
    id = Column(Integer, primary_key=True)
    entry_id = Column(Integer, ForeignKey('master_entries.id'))
    content = Column(Text, nullable=False)
    # Metadata for AI matching
    embedding_json = Column(Text, nullable=True) 
    
    entry = relationship("MasterEntry", back_populates="bullets")

class Job(Base):
    __tablename__ = 'jobs'
    
    id = Column(Integer, primary_key=True)
    company = Column(String)
    title = Column(String)
    description_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class ResumeSnapshot(Base):
    __tablename__ = 'resume_snapshots'
    
    id = Column(Integer, primary_key=True)
    job_id = Column(Integer, ForeignKey('jobs.id'))
    # Storing the JSON structure used to generate this specific PDF
    frozen_data_json = Column(Text, nullable=False) 
    cover_letter_text = Column(Text, nullable=True)
    pdf_path = Column(String)
    generated_at = Column(DateTime, default=datetime.utcnow)

# --- 2. Setup Database ---
engine = create_engine('sqlite:///resume_tailor.db')
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()

# --- 3. HTML/Jinja2 Template ---
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <style>
        @page { size: A4; margin: 2cm; }
        body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 11pt; line-height: 1.4; color: #333; }
        h1 { font-size: 24pt; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
        .contact-info { font-size: 10pt; margin-bottom: 20px; color: #666; }
        h2 { font-size: 14pt; border-bottom: 2px solid #333; padding-bottom: 5px; margin-top: 20px; margin-bottom: 10px; text-transform: uppercase; }
        .job-header { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 5px; }
        .company { font-weight: bold; }
        .dates { text-align: right; }
        .role { font-style: italic; color: #444; margin-bottom: 5px; }
        ul { padding-left: 20px; margin-top: 0; }
        li { margin-bottom: 4px; }
    </style>
</head>
<body>
    <h1>{{ profile.name }}</h1>
    <div class="contact-info">
        {{ profile.email }} | {{ profile.phone }} | {{ profile.location }}
    </div>

    <h2>Summary</h2>
    <p>{{ profile.summary }}</p>

    <h2>Experience</h2>
    {% for entry in profile.experiences %}
    <div class="entry">
        <div class="job-header">
            <span class="company">{{ entry.company }}</span>
            <span class="dates">{{ entry.startDate }} - {{ entry.endDate }}</span>
        </div>
        <div class="role">{{ entry.role }}</div>
        <ul>
            {% for bullet in entry.bullets %}
            <li>{{ bullet.content }}</li>
            {% endfor %}
        </ul>
    </div>
    {% endfor %}
</body>
</html>
"""

# --- 4. Main Execution (Phase 1 Proof of Concept) ---
def generate_pdf_poc(output_filename="test_resume.pdf"):
    print("Generating PDF...")
    
    # Mock Data (In real app, query SQLAlchemy)
    mock_data = {
        "name": "ALEX MERCER",
        "email": "alex@example.com",
        "phone": "555-0199",
        "location": "New York, NY",
        "summary": "Senior Backend Engineer favoring WeasyPrint over ReportLab.",
        "experiences": [
            {
                "company": "FinTech Global",
                "role": "Senior Python Developer",
                "startDate": "2021",
                "endDate": "Present",
                "bullets": [
                    {"content": "Conducted variance analysis on Q3 financial statements, identifying a $50k discrepancy."},
                    {"content": "Directed a team of 4 analysts to automate monthly reporting, saving 12 hours per week."}
                ]
            }
        ]
    }

    # Render HTML
    env = Environment(autoescape=select_autoescape())
    template = env.from_string(HTML_TEMPLATE)
    html_out = template.render(profile=mock_data)

    # Convert to PDF
    HTML(string=html_out).write_pdf(output_filename)
    print(f"Success! Saved to {output_filename}")

if __name__ == "__main__":
    generate_pdf_poc()
`;

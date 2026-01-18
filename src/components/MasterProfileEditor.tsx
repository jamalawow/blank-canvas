import React, { useState } from 'react';
import { MasterProfile, Experience, Education, BulletPoint, generateId } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Globe, 
  Plus, 
  Trash2, 
  GripVertical,
  Briefcase,
  GraduationCap,
  FileText,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface MasterProfileEditorProps {
  profile: MasterProfile;
  setProfile: React.Dispatch<React.SetStateAction<MasterProfile>>;
}

export const MasterProfileEditor: React.FC<MasterProfileEditorProps> = ({ profile, setProfile }) => {
  const [newSkill, setNewSkill] = useState('');
  const [expandedExperiences, setExpandedExperiences] = useState<Set<string>>(new Set());

  const toggleExperience = (id: string) => {
    const newExpanded = new Set(expandedExperiences);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedExperiences(newExpanded);
  };

  const updateField = <K extends keyof MasterProfile>(field: K, value: MasterProfile[K]) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      updateField('skills', [...profile.skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    updateField('skills', profile.skills.filter(s => s !== skill));
  };

  // Experience CRUD
  const addExperience = () => {
    const newExp: Experience = {
      id: generateId(),
      company: '',
      title: '',
      location: '',
      startDate: '',
      endDate: '',
      bullets: []
    };
    updateField('experiences', [...profile.experiences, newExp]);
    setExpandedExperiences(new Set([...expandedExperiences, newExp.id]));
  };

  const updateExperience = (id: string, updates: Partial<Experience>) => {
    updateField('experiences', profile.experiences.map(exp => 
      exp.id === id ? { ...exp, ...updates } : exp
    ));
  };

  const removeExperience = (id: string) => {
    updateField('experiences', profile.experiences.filter(exp => exp.id !== id));
  };

  // Bullet CRUD
  const addBullet = (expId: string) => {
    const newBullet: BulletPoint = {
      id: generateId(),
      text: '',
      isEnabled: true
    };
    updateField('experiences', profile.experiences.map(exp => 
      exp.id === expId ? { ...exp, bullets: [...exp.bullets, newBullet] } : exp
    ));
  };

  const updateBullet = (expId: string, bulletId: string, updates: Partial<BulletPoint>) => {
    updateField('experiences', profile.experiences.map(exp => 
      exp.id === expId 
        ? { ...exp, bullets: exp.bullets.map(b => b.id === bulletId ? { ...b, ...updates } : b) }
        : exp
    ));
  };

  const removeBullet = (expId: string, bulletId: string) => {
    updateField('experiences', profile.experiences.map(exp => 
      exp.id === expId 
        ? { ...exp, bullets: exp.bullets.filter(b => b.id !== bulletId) }
        : exp
    ));
  };

  // Education CRUD
  const addEducation = () => {
    const newEdu: Education = {
      id: generateId(),
      institution: '',
      degree: '',
      field: '',
      graduationDate: ''
    };
    updateField('education', [...profile.education, newEdu]);
  };

  const updateEducation = (id: string, updates: Partial<Education>) => {
    updateField('education', profile.education.map(edu => 
      edu.id === id ? { ...edu, ...updates } : edu
    ));
  };

  const removeEducation = (id: string) => {
    updateField('education', profile.education.filter(edu => edu.id !== id));
  };

  return (
    <div className="h-full overflow-auto p-6 space-y-8 animate-fade-in">
      {/* Personal Information */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" /> Full Name
              </label>
              <Input
                value={profile.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="John Doe"
                className="focus-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email
              </label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="john@example.com"
                className="focus-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" /> Phone
              </label>
              <Input
                value={profile.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="focus-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Location
              </label>
              <Input
                value={profile.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="San Francisco, CA"
                className="focus-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Linkedin className="h-4 w-4" /> LinkedIn
              </label>
              <Input
                value={profile.linkedin || ''}
                onChange={(e) => updateField('linkedin', e.target.value)}
                placeholder="linkedin.com/in/johndoe"
                className="focus-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Globe className="h-4 w-4" /> Website
              </label>
              <Input
                value={profile.website || ''}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="johndoe.com"
                className="focus-ring"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Professional Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={profile.summary}
            onChange={(e) => updateField('summary', e.target.value)}
            placeholder="Write a compelling 2-3 sentence summary highlighting your key strengths and career goals..."
            className="min-h-[100px] focus-ring resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Tip: Focus on measurable achievements and specific expertise. Avoid buzzwords.
          </p>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            Skills
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSkill()}
              placeholder="Add a skill (e.g., Python, Project Management)"
              className="focus-ring"
            />
            <Button onClick={addSkill} size="sm" className="shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="px-3 py-1 text-sm group hover:bg-destructive/10 cursor-pointer transition-colors"
                onClick={() => removeSkill(skill)}
              >
                {skill}
                <X className="h-3 w-3 ml-2 opacity-50 group-hover:opacity-100" />
              </Badge>
            ))}
            {profile.skills.length === 0 && (
              <p className="text-sm text-muted-foreground">No skills added yet. Start typing above.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="h-5 w-5 text-primary" />
              Work Experience
            </CardTitle>
            <Button onClick={addExperience} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" /> Add Role
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.experiences.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">No experience entries yet.</p>
              <p className="text-xs">Click "Add Role" to get started.</p>
            </div>
          ) : (
            profile.experiences.map((exp) => (
              <div 
                key={exp.id} 
                className="border rounded-lg overflow-hidden bg-card"
              >
                {/* Experience Header */}
                <div 
                  className="flex items-center gap-3 p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleExperience(exp.id)}
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground/50" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {exp.title || 'Untitled Role'} 
                      {exp.company && <span className="text-muted-foreground font-normal"> at {exp.company}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {exp.startDate || 'Start'} — {exp.endDate || 'End'} • {exp.bullets.length} bullets
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); removeExperience(exp.id); }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {expandedExperiences.has(exp.id) ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                {/* Experience Details */}
                {expandedExperiences.has(exp.id) && (
                  <div className="p-4 space-y-4 border-t animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        value={exp.title}
                        onChange={(e) => updateExperience(exp.id, { title: e.target.value })}
                        placeholder="Job Title"
                        className="focus-ring"
                      />
                      <Input
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                        placeholder="Company Name"
                        className="focus-ring"
                      />
                      <Input
                        value={exp.location}
                        onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                        placeholder="Location"
                        className="focus-ring"
                      />
                      <div className="flex gap-2">
                        <Input
                          value={exp.startDate}
                          onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                          placeholder="Start Date"
                          className="focus-ring"
                        />
                        <Input
                          value={exp.endDate}
                          onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                          placeholder="End Date"
                          className="focus-ring"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Bullets */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-muted-foreground">Bullet Points</h4>
                        <Button 
                          onClick={() => addBullet(exp.id)} 
                          size="sm" 
                          variant="ghost"
                          className="h-7 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Bullet
                        </Button>
                      </div>
                      {exp.bullets.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-4 text-center">
                          No bullet points. Add achievements and responsibilities.
                        </p>
                      ) : (
                        exp.bullets.map((bullet, idx) => (
                          <div key={bullet.id} className="flex gap-2 items-start group">
                            <span className="text-muted-foreground text-sm mt-2.5 w-4">{idx + 1}.</span>
                            <Textarea
                              value={bullet.text}
                              onChange={(e) => updateBullet(exp.id, bullet.id, { text: e.target.value })}
                              placeholder="Describe an achievement with metrics (e.g., 'Reduced API latency by 40% by implementing caching layer')"
                              className="min-h-[60px] focus-ring resize-none text-sm flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeBullet(exp.id, bullet.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive h-8 w-8 mt-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5 text-primary" />
              Education
            </CardTitle>
            <Button onClick={addEducation} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" /> Add Education
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.education.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">No education entries yet.</p>
            </div>
          ) : (
            profile.education.map((edu) => (
              <div key={edu.id} className="border rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                    placeholder="Institution Name"
                    className="focus-ring"
                  />
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                    placeholder="Degree (e.g., B.S., M.S., Ph.D.)"
                    className="focus-ring"
                  />
                  <Input
                    value={edu.field}
                    onChange={(e) => updateEducation(edu.id, { field: e.target.value })}
                    placeholder="Field of Study"
                    className="focus-ring"
                  />
                  <div className="flex gap-2">
                    <Input
                      value={edu.graduationDate}
                      onChange={(e) => updateEducation(edu.id, { graduationDate: e.target.value })}
                      placeholder="Graduation Date"
                      className="focus-ring flex-1"
                    />
                    <Input
                      value={edu.gpa || ''}
                      onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
                      placeholder="GPA"
                      className="focus-ring w-20"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(edu.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

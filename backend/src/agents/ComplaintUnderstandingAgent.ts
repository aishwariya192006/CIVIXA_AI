// Mock Implementation for AI Agent 1
export const understandComplaint = async (title: string, description: string, hasVoice?: boolean, hasFile?: boolean) => {
  // Simulate AI Processing time
  await new Promise(resolve => setTimeout(resolve, hasVoice || hasFile ? 1200 : 500));

  console.log(`[AI AGENT 1] Understanding complaint: ${title}`);
  
  if (hasVoice) {
    console.log(`[AI AGENT 1] Processing Voice Audio... -> Transcribed to text.`);
    description += ' [Voice Transcript: The user sounded distressed about the issue.]';
  }

  if (hasFile) {
    console.log(`[AI AGENT 1] Processing Image OCR... -> Extracted text from image.`);
    description += ' [OCR Result: Found text in image matching issue context.]';
  }

  // Simulated intelligence based on keywords
  let categoryName = 'General';
  let severity = 3;
  let urgency = 3;
  let aiKeywords = ['issue', 'complaint'];
  let aiTags = ['public'];

  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes('water') || lowerDesc.includes('leak') || lowerDesc.includes('pipe')) {
    categoryName = 'Water Supply';
    severity = 6;
    aiKeywords = ['water', 'leakage', 'plumbing'];
  } else if (lowerDesc.includes('electricity') || lowerDesc.includes('power') || lowerDesc.includes('wire')) {
    categoryName = 'Electricity';
    severity = 8;
    urgency = 9;
    aiKeywords = ['electricity', 'power outage', 'hazard'];
  } else if (lowerDesc.includes('road') || lowerDesc.includes('pothole') || lowerDesc.includes('traffic')) {
    categoryName = 'Roads & Transport';
    severity = 5;
    aiKeywords = ['road', 'infrastructure', 'traffic hazard'];
  } else if (lowerDesc.includes('pollution') || lowerDesc.includes('smoke') || lowerDesc.includes('garbage') || lowerDesc.includes('trash') || lowerDesc.includes('waste')) {
    categoryName = 'Environment & Public Health';
    severity = 4;
    urgency = 4;
    aiKeywords = ['pollution', 'sanitation', 'health'];
  } else {
    categoryName = 'General Services';
    aiKeywords = ['general', 'miscellaneous'];
  }

  return {
    categoryName,
    severity,
    urgency,
    peopleAffected: Math.floor(Math.random() * 50) + 1,
    aiSummary: `This complaint is regarding ${categoryName.toLowerCase()} and requires attention with severity ${severity}.`,
    aiKeywords: JSON.stringify(aiKeywords),
    aiTags: JSON.stringify(aiTags)
  };
};

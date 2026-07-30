export const calculatePriority = (severity: number, urgency: number, peopleAffected: number) => {
  console.log(`[AI AGENT 4] Calculating Priority for severity: ${severity}, urgency: ${urgency}, people: ${peopleAffected}`);
  
  let baseScore = (severity * 1.5) + urgency;
  
  // High impact multiplier
  if (peopleAffected > 50) baseScore += 5;
  if (peopleAffected > 200) baseScore += 10;
  
  let priority = 'LOW';
  let deadlineHours = 72; // default 3 days
  
  if (baseScore > 20) {
    priority = 'CRITICAL';
    deadlineHours = 4; 
  } else if (baseScore > 15) {
    priority = 'HIGH';
    deadlineHours = 12;
  } else if (baseScore > 10) {
    priority = 'MEDIUM';
    deadlineHours = 24;
  }

  const deadline = new Date(Date.now() + deadlineHours * 60 * 60 * 1000);

  return {
    priorityScore: baseScore,
    priority,
    deadline,
    reason: `Based on a severity of ${severity}, urgency of ${urgency}, affecting ${peopleAffected} people.`
  };
};

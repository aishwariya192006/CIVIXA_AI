import prisma from '../utils/prisma';

export const detectDuplicate = async (title: string, categoryName: string, district?: string, description?: string) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  console.log(`[AI AGENT 3] Checking for duplicates in district: ${district || 'ALL'}`);

  // For MVP: Check if an unresolved complaint exists in the same district
  const existingComplaints = await prisma.complaint.findMany({
    where: {
      district: district || undefined,
      status: { notIn: ['RESOLVED', 'COMPLETED', 'REJECTED'] }
    }
  });

  const cleanString = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  const isDuplicate = existingComplaints.find(c => {
    const titleMatch = cleanString(c.title) === cleanString(title);
    const descMatch = description && c.description ? cleanString(c.description).includes(cleanString(description).substring(0, 20)) : false;
    return titleMatch || descMatch;
  });

  if (isDuplicate) {
      return {
        isDuplicate: true,
        duplicateOfId: isDuplicate.id,
        message: 'Duplicate problems already registered. You can join the existing complaint.'
      };
  }

  return { isDuplicate: false };
};

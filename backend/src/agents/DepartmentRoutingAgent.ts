import prisma from '../utils/prisma';

// Mock Implementation for AI Agent 2
export const routeDepartment = async (categoryName: string, district: string | null) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(`[AI AGENT 2] Routing complaint for category: ${categoryName}`);

  // Find department (fuzzy match)
  const departments = await prisma.department.findMany();
  let department = departments.find(d => d.name.toLowerCase() === categoryName.toLowerCase());
  
  if (!department) {
    department = departments.find(d => categoryName.toLowerCase().includes(d.name.toLowerCase().split(' ')[0]));
  }
  
  if (!department && departments.length > 0) {
    // Default to the first department if no match to avoid unassigned bugs
    department = departments[0];
  }

  if (!department) return null;

  // Find officer in this department and district
  let officer = null;
  if (district) {
    officer = await prisma.user.findFirst({
      where: { 
        roleName: 'OFFICER', 
        departmentId: department.id,
        district: { equals: district, mode: 'insensitive' }
      }
    });
  }

  // Fallback 1: Officer in department (any district)
  if (!officer) {
    officer = await prisma.user.findFirst({
      where: { 
        roleName: 'OFFICER', 
        departmentId: department.id 
      }
    });
  }

  // Fallback 2: Any officer in the district
  if (!officer && district) {
    officer = await prisma.user.findFirst({
      where: { 
        roleName: 'OFFICER',
        district: { equals: district, mode: 'insensitive' }
      }
    });
  }

  // Fallback 3: Any officer
  if (!officer) {
    officer = await prisma.user.findFirst({
      where: { roleName: 'OFFICER' }
    });
  }

  return {
    departmentId: department.id,
    assignedOfficerId: officer?.id || null
  };
};

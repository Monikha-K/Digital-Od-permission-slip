import { getMentorsByDepartment as getMentorsAPI, getAdvisorsByDepartmentAndYear as getAdvisorsAPI, getCFI as getCFIAPI } from './api';

// Get mentors by department from backend
export const getMentorsByDepartment = async (department) => {
  try {
    return await getMentorsAPI(department);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return [];
  }
};

// Get advisors by department and year from backend
export const getAdvisorsByDepartmentAndYear = async (department, year) => {
  try {
    return await getAdvisorsAPI(department, year);
  } catch (error) {
    console.error('Error fetching advisors:', error);
    return [];
  }
};

// Get CFI from backend
export const getCFI = async () => {
  try {
    return await getCFIAPI();
  } catch (error) {
    console.error('Error fetching CFI:', error);
    return null;
  }
};

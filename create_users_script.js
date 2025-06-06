// Script to create ICT_Administrator, Proprietor, and Bursar for all schools
// This script will be executed manually via API calls

const schools = [
  {
    id: "68405b7d80498c76b2126e71",
    name: "Annunciation Secondary School",
    shortName: "ASS"
  },
  {
    id: "68405fd33f705d8a6ae77355", 
    name: "Annunciation Primary School",
    shortName: "APS"
  },
  {
    id: "684062343f705d8a6ae773b6",
    name: "Holyghost Secondary School", 
    shortName: "HSS"
  },
  {
    id: "684063521c5ba900ed1c9302",
    name: "Test School Fixed",
    shortName: "TSF"
  },
  {
    id: "68406529007c8504c1f3f6aa",
    name: "Annunciation Nursery School",
    shortName: "ANS"
  }
];

const userTemplates = [
  {
    role: "ICT_administrator",
    namePrefix: "ICT Admin",
    emailSuffix: "ict"
  },
  {
    role: "Proprietor", 
    namePrefix: "Proprietor",
    emailSuffix: "proprietor"
  },
  {
    role: "Bursar",
    namePrefix: "Bursar", 
    emailSuffix: "bursar"
  }
];

// Address template for users
const addressTemplate = {
  country: "Nigeria",
  state: "Ebonyi", 
  town: "Abakaliki",
  street: "School Street",
  street_no: 1,
  zip_code: 480211
};

// Generate user data for each school and role
const generateUserData = (school, userTemplate, addressId) => {
  const baseEmail = school.name.toLowerCase().replace(/\s+/g, '');
  
  return {
    school_id: school.id,
    firstname: userTemplate.namePrefix,
    middlename: "School",
    lastname: school.shortName,
    email: `${userTemplate.emailSuffix}@${baseEmail}.com`,
    phone: `+234${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    address_id: addressId,
    DOB: "1980-01-01",
    gender: "Male",
    roles: [userTemplate.role],
    password: `${userTemplate.role.toLowerCase()}123`
  };
};

console.log("User creation data prepared for:", schools.length, "schools");
console.log("Roles to create:", userTemplates.map(t => t.role));

export const APPLICANTS_CSV_RAW = `applicant_id,full_name,gender,age,state,district,annual_family_income,estimated_project_cost,education_level,social_category,special_category,prior_experience_years,eligibility_status
APP-101,Ramesh Kadam,Male,34,Maharashtra,Pune,"₹1,80,000",10 lakh,10th Pass,OBC,Rural General,4,ELIGIBLE_PMEGP
APP-102,Sunita Bai Rathod,Female,29,Maharashtra,Satara,"₹95,000",5 lakh,8th Pass,SC,Women Rural,6,ELIGIBLE_STANDUP
APP-103,Venkatesh Rao,Male,42,Telangana,Rangareddy,"₹2,40,000",15 lakh,Graduate,General,Urban,8,ELIGIBLE_MUDRA_TARUN
APP-104,Lakshmi Devi,Female,31,Telangana,Hyderabad,"₹1,20,000",3.5 lakh,12th Pass,OBC,Women Urban,3,ELIGIBLE_MUDRA_KISHORE
APP-105,Anand Shinde,Male,16,Maharashtra,Pune,"₹1,50,000",8 lakh,10th Pass,General,Rural,1,INVALID_AGE_UNDERAGE
APP-106,Pooja Hegde,Female,27,Karnataka,Bengaluru Urban,"₹3,00,000",12 lakh,Post Graduate,General,Women,2,ELIGIBLE_PMEGP
APP-107,Basavaraj Patil,Male,38,Karnataka,Belagavi,"₹1,60,000",-50000,10th Pass,General,Rural,5,INVALID_NEGATIVE_COST
APP-108,Ramesh Kadam,Male,34,Maharashtra,Pune,"₹1,80,000",10 lakh,10th Pass,OBC,Rural General,4,DUPLICATE_APP_101
APP-109,Kavita Mohite,Female,36,Maharashtra,Kolhapur,"₹2,10,000",7.5 lakh,Graduate,OBC,Women Rural,7,ELIGIBLE_PMEGP
APP-110,Suresh Reddy,Male,45,Andhra Pradesh,Chittoor,"₹2,80,000",20 lakh,Diploma,General,Rural,12,ELIGIBLE_STANDUP
`;

export const ENTREPRENEUR_CSV_RAW = `entrepreneur_id,name,gender,age,state,district,business_idea,business_category,available_own_capital,years_of_experience,location_type,preferred_language
ENT-201,Rajesh Gaikwad,Male,32,Maharashtra,Pune,Modern dairy farming with 10 crossbred cows,Dairy,1 lakh,5,rural,mr
ENT-202,Kavita Devi,Female,28,Maharashtra,Satara,Boutique and women tailoring garment unit,Tailoring,50k,4,rural,mr
ENT-203,Srinivas Goud,Male,39,Telangana,Rangareddy,Kirana general provisions & FMCG retail store,Kirana Retail,"₹75,000",7,semi-urban,te
ENT-204,Manjula Reddy,Female,35,Telangana,Hyderabad,Commercial layer poultry farming unit,Poultry,2.5 lakh,3,rural,te
ENT-205,Santosh Deshmukh,Male,44,Maharashtra,Pune,Organic flour mill & cold pressed oil processing,Food Processing,1.5 lakh,8,rural,mr
ENT-206,Praveen Kumar,Male,26,Karnataka,Bengaluru Urban,Mobile repair and accessories sales shop,Electronics Services,80000,2,urban,kn
ENT-207,Sneha Kulkarni,Female,30,Maharashtra,Satara,Handloom embroidery and designer blouse tailoring,Tailoring,60000,6,rural,en
ENT-208,Vijay Patil,Male,52,Maharashtra,Kolhapur,Goat rearing and livestock breeding farm,Animal Husbandry,1.2 lakh,10,rural,hi
ENT-209,Meera Sen,Female,29,West Bengal,Kolkata,Eco-friendly jute bag manufacturing unit,Manufacturing,1 lakh,4,urban,bengali
ENT-210,Rajesh Gaikwad,Male,32,Maharashtra,Pune,Modern dairy farming with 10 crossbred cows,Dairy,1 lakh,5,rural,mr
`;

export const LOAN_CSV_RAW = `application_id,applicant_name,annual_income,project_type,estimated_project_cost,requested_loan_amount,education_status,bank_account_status,preferred_language,state,district
LOAN-301,Ramesh Kadam,1.8 lakh,Dairy Enterprise,10 lakh,9 lakh,10th Pass,Active,mr,Maharashtra,Pune
LOAN-302,Sunita Bai Rathod,95000,Garment Tailoring,5 lakh,4.5 lakh,8th Pass,Active,mr,Maharashtra,Satara
LOAN-303,Venkatesh Rao,2.4 lakh,FMCG Retail Shop,15 lakh,13.5 lakh,Graduate,Active,te,Telangana,Rangareddy
LOAN-304,Lakshmi Devi,1.2 lakh,Poultry Farm,3.5 lakh,3.15 lakh,12th Pass,Active,te,Telangana,Hyderabad
LOAN-305,Anand Shinde,1.5 lakh,Retail Grocery,8 lakh,7.2 lakh,10th Pass,Inactive,hi,Maharashtra,Pune
LOAN-306,Pooja Hegde,3 lakh,Food Processing,12 lakh,10.8 lakh,Post Graduate,Active,kn,Karnataka,Bengaluru Urban
LOAN-307,Kavita Mohite,2.1 lakh,Tailoring Unit,7.5 lakh,6.75 lakh,Graduate,Active,mr,Maharashtra,Kolhapur
LOAN-308,Suresh Reddy,2.8 lakh,Agri Equipment Services,20 lakh,18 lakh,Diploma,Active,te,Andhra Pradesh,Chittoor
LOAN-309,Venkatesh Rao,2.4 lakh,FMCG Retail Shop,12 lakh,10.8 lakh,Graduate,Active,te,Telangana,Rangareddy
LOAN-310,Ramesh Kadam,1.8 lakh,Dairy Enterprise,10 lakh,9 lakh,10th Pass,Active,mr,Maharashtra,Pune
`;

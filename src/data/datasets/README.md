# UDYORA Dataset Ingestion & Normalization Repository

This directory contains the canonical demonstration CSV datasets used for testing, boundary verification, and data modeling in the UDYORA platform.

> [!IMPORTANT]
> **PROVENANCE CLASSIFICATION: DEMO / TEST DATA**
> These datasets are strictly demonstration and synthetic test records. They are NOT verified government data, live banking records, or real beneficiary PII.

---

## 1. Datasets Overview

### Dataset A: Applicant & Eligibility Records (`applicants_eligibility.csv`)
- **Focus**: Applicant demographics, education, social category, annual family income, estimated project cost, and scheme eligibility flags.
- **Columns**: `applicant_id`, `full_name`, `gender`, `age`, `state`, `district`, `annual_family_income`, `estimated_project_cost`, `education_level`, `social_category`, `special_category`, `prior_experience_years`, `eligibility_status`
- **Test Cases Included**:
  - Valid applicants (PMEGP, Stand-Up India, Mudra)
  - Underage applicant boundary (`APP-105`, Age 16)
  - Negative cost anomaly (`APP-107`, Project Cost -₹50,000)
  - Duplicate record detection (`APP-108` duplicate of `APP-101`)

### Dataset B: Entrepreneur Profiles (`entrepreneur_profiles.csv`)
- **Focus**: Real entrepreneurial business ideas, available own capital, years of experience, location classification, and multilingual preferences.
- **Columns**: `entrepreneur_id`, `name`, `gender`, `age`, `state`, `district`, `business_idea`, `business_category`, `available_own_capital`, `years_of_experience`, `location_type`, `preferred_language`
- **Test Cases Included**:
  - Capital normalization: `1 lakh` -> `100000`, `50k` -> `50000`, `₹75,000` -> `75000`
  - Multilingual mappings: Marathi (`mr`), Telugu (`te`), Kannada (`kn`), Hindi (`hi`), English (`en`)
  - Unsupported language handling: Bengali (`bengali`) marked as `UNSUPPORTED_LANGUAGE`
  - Duplicate entrepreneur detection (`ENT-210` duplicate of `ENT-201`)

### Dataset C: Loan & Application Records (`loan_applications.csv`)
- **Focus**: Requested loan amounts, banking status, education, and financial ratio cross-checks.
- **Columns**: `application_id`, `applicant_name`, `annual_income`, `project_type`, `estimated_project_cost`, `requested_loan_amount`, `education_status`, `bank_account_status`, `preferred_language`, `state`, `district`
- **Test Cases Included**:
  - Loan requested vs calculated financing requirement cross-validation
  - Inactive bank account flag (`LOAN-305`)
  - Cross-dataset discrepancy detection (`LOAN-309` project cost discrepancy with `APP-101`)

---

## 2. Normalization Rules
1. **Capital / Currency**: Converted to integer INR amounts using Indian Numbering System (`1 lakh` = 100,000; `1.5 lakh` = 150,000; `50k` = 50,000). Negative numbers are rejected with `NEGATIVE_VALUE`.
2. **Business Category**: Mapped to canonical UDYORA categories (`dairy`, `retail`, `tailoring`, `poultry`, `food_processing`, `manufacturing`, `services`, `custom`).
3. **Location**: Matched against canonical Local Government Directory (LGD) hierarchy (`lgdHierarchy.ts`). Unmatched entries receive `REQUIRES_VERIFICATION`.
4. **Language**: Standardized to supported ISO codes (`en`, `hi`, `mr`, `te`, `kn`). Unsupported languages are preserved as raw values with a safe fallback.
5. **PII Masking**: Personal names are masked in public and general admin table views (e.g., `Ramesh Kadam` -> `R**** K****`).

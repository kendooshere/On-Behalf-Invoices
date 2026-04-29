**✔1.The Problem:**
At my previous job at a Real Estate builder company, we had to generate "On-Behalf-Rental-Invoices" every month for the customers that were under "Lease Plan" (_Meaning our company's leasing team would work to get a commercial brand at the shop the customer owned, and when the brand came, the agreement would be signed between the brand and the customer, but because we are handling the lease for the customer, we will have to create an invoice for the customer to let them claim rent from the brand._)

Now, suppose there is a brand **X**, and 10+ customers have invested into the brand (_By buying units in the shop that the brand uses_), and out of 10, 8 are under "Lease plan", so we will have to make 8 invoice seperately, with distinct customer's personal and bank details, along with the calculated rental. This is a very manual and time taking process and would induce the following problems: 

>**Manual Effort**: Drafting each invoice in MS Word, filling in brand details, rent calculations, and tax figures manually.

>**Errors**: High risk of calculation mistakes and formatting inconsistencies.

>**Time**: Took approximately 15-20 hours per week of manual data entry.

**✌2.The Solution**:
**I engineered a high-efficiency automation tool using Node.js that transforms this multi-day task into a few minutes of automated processing.**

>**Tech Stack**: Node.js, Express.js, PizZip, Docxtemplater, Nodemailer.

>**API Architecture**: RESTful API endpoint (/generate-invoice) that accepts brand and amount data to trigger a document workflow.

>**Dynamic PDF Engine**: Automated conversion from .docx to .pdf using a headless LibreOffice shell command (exec).

>**Automated Dispatch**: Integrated Gmail SMTP to automatically mail the final PDF to the customer once generation is successful.

**✨3.Key Features**
Batch Processing: Generates hundreds of invoices in one go from a structured data source (Excel/JSON).

Precision Mapping: Automatically injects brand-specific rent, area, and utility calculations into Word templates.

PDF Auto-Generation: Seamlessly converts .docx drafts to final .pdf files for distribution.

90% Time Reduction: Reduced the entire drafting lifecycle from days to minutes.

Auto Email: Emails the invoice with a dedicated draft to the customers once the invoice generation is successful.

**📈 Business Impact**
Efficiency: Saved 15+ manual hours weekly, allowing the team to focus on high-value tasks.

Data Integrity: Eliminated human error in financial figures, ensuring 100% accuracy in invoicing records.

Scalability: The system easily handles any newly added brands/customers in invoicing without extra manpower.

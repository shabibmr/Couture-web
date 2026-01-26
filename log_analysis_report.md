# Log Analysis Report

## Analysis Summary
**Log Files Analyzed:** `admin.log`, `backend.log`, `customer.log`
**Status:** Services started successfully after resolving multiple port conflicts.
**Critical Errors:** None found.

## Warnings and Errors (Chronological Order)

The following warnings regarding port availability were captured during the startup sequence:

### Admin Service (`admin.log`)
1.  `Port 5174 is in use, trying another one...`
2.  `Port 5175 is in use, trying another one...`
3.  `Port 5176 is in use, trying another one...`
4.  `Port 5177 is in use, trying another one...`
5.  `Port 5178 is in use, trying another one...`
6.  `Port 5179 is in use, trying another one...`
7.  `Port 5180 is in use, trying another one...`
8.  `Port 5181 is in use, trying another one...`
9.  `Port 5182 is in use, trying another one...`
10. `Port 5183 is in use, trying another one...`
11. `Port 5184 is in use, trying another one...`
12. `Port 5185 is in use, trying another one...`
13. `Port 5186 is in use, trying another one...`
14. `Port 5187 is in use, trying another one...`
15. `Port 5188 is in use, trying another one...`
16. `Port 5189 is in use, trying another one...`

### Customer Service (`customer.log`)
17. `Port 5173 is in use, trying another one...`
18. `Port 5174 is in use, trying another one...`
19. `Port 5175 is in use, trying another one...`
20. `Port 5176 is in use, trying another one...`
21. `Port 5177 is in use, trying another one...`
22. `Port 5178 is in use, trying another one...`
23. `Port 5179 is in use, trying another one...`
24. `Port 5180 is in use, trying another one...`
25. `Port 5181 is in use, trying another one...`
26. `Port 5182 is in use, trying another one...`
27. `Port 5183 is in use, trying another one...`
28. `Port 5184 is in use, trying another one...`
29. `Port 5185 is in use, trying another one...`
30. `Port 5186 is in use, trying another one...`
31. `Port 5187 is in use, trying another one...`
32. `Port 5188 is in use, trying another one...`

### Backend Service (`backend.log`)
No errors or warnings found.

---
**Note:** The system resolved these conflicts automatically.
- **Admin** settled on port **5190**.
- **Customer** settled on port **5189**.
- **Backend** started cleanly on port **5000**.

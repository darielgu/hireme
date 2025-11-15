# Insights API Response Format

This directory contains JSON files that define the exact structure required for the `/api/insights` endpoint response.

## Files

1. **`insights-api-response-example.json`** - Complete example with sample data showing the expected format
2. **`insights-api-response-template.json`** - Minimal blank template with empty arrays/null values
3. **`insights-api-response-template-detailed.json`** - Detailed template with comments explaining each field

## API Endpoint

The frontend expects data from: `GET /api/insights`

## Data Structure Requirements

### Root Object
The response must be a JSON object with the following top-level keys:

- `topics` (array of strings) - Predicted interview topics
- `interviewerIntel` (object or null) - Information about the interviewer
- `fitScore` (object or null) - Candidate fit score and recommendations
- `companyResearch` (object or null) - Company information
- `studyPlan` (array) - 7-day study plan with daily topics
- `practiceQuestions` (array) - Practice interview questions
- `peopleInRole` (array) - People currently in the target role

### Important Constraints

1. **Difficulty Values**: Must be exactly `"Easy"`, `"Medium"`, or `"Hard"` (case-sensitive)
2. **Score Range**: `fitScore.score` must be a number between 0-100
3. **Time Units**: `estimatedTime` in practice questions is in minutes
4. **Null Values**: `interviewerIntel`, `fitScore`, and `companyResearch` can be `null` if data is unavailable
5. **Arrays**: All array fields should be arrays, even if empty `[]`

### Field Descriptions

#### `topics`
Array of topic strings that will be displayed as pills on the Home tab.

#### `interviewerIntel`
Object containing:
- `yearsOfExperience` (string)
- `technicalSpecialties` (string)
- `predictedQuestionAreas` (string)
- `backgroundSummary` (string)

#### `fitScore`
Object containing:
- `score` (number, 0-100) - Displayed as percentage in circular progress bar
- `skillsGaps` (string)
- `recommendedImprovements` (string)

#### `companyResearch`
Object containing:
- `companyValues` (string)
- `hiringStyle` (string)
- `cultureSummary` (string)
- `interviewPatterns` (string)

#### `studyPlan`
Array of objects, each representing one day (1-7):
- `day` (number, 1-7)
- `title` (string)
- `description` (string)
- `leetcodeQuestions` (array of objects with `title` and `difficulty`)
- `resources` (array of strings)

#### `practiceQuestions`
Array of objects, each containing:
- `id` (string) - Unique identifier
- `category` (string)
- `difficulty` ("Easy" | "Medium" | "Hard")
- `estimatedTime` (number, minutes)
- `title` (string)
- `description` (string)
- `keyDiscussionPoints` (array of strings)

#### `peopleInRole`
Array of objects, each containing:
- `name` (string)
- `role` (string)
- `yearsInRole` (number)
- `background` (string)
- `interviewTip` (string)
- `waysToConnect` (array of strings)

## Usage for LLM

When generating the response, the LLM should:
1. Use the example file as a reference for the exact structure
2. Fill in all fields with relevant, personalized data based on:
   - The user's resume
   - The job description
   - The interviewer's LinkedIn profile
3. Ensure all difficulty values match exactly ("Easy", "Medium", "Hard")
4. Ensure all required fields are present (no missing keys)
5. Use appropriate data types (strings, numbers, arrays, objects)

## Testing

You can test your API response by:
1. Starting the frontend development server
2. Making a request to your backend endpoint
3. Verifying the response matches the structure in `insights-api-response-example.json`
4. Checking that all sections populate correctly in the UI


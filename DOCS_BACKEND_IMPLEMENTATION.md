# Documentation Backend Implementation Notes

The current docs page is fully static and powered by `src/data/auroraDocs.json`. No backend is required for the first version.

If dynamic documentation is needed later, implement a small CMS-style API with these endpoints.

## Suggested endpoints

### List published docs

`GET /docs?status=published`

Response:

```json
{
  "meta": {
    "productName": "Aurora Agent Studio",
    "version": "1.0.0",
    "updatedAt": "2026-08-16"
  },
  "sections": []
}
```

### Get one section

`GET /docs/{sectionId}`

Response should match one section from `src/data/auroraDocs.json`.

### Create/update section

`PUT /docs/{sectionId}`

Payload template:

```json
{
  "id": "react-agent",
  "label": "ReAct Agent",
  "icon": "Bot",
  "summary": "Configure autonomous agents with tools and memory.",
  "description": "Short user-facing explanation.",
  "features": ["Feature one"],
  "howTo": ["Step one"],
  "dataShape": {},
  "tips": ["Best practice"]
}
```

### Publish docs version

`POST /docs/publish`

Payload:

```json
{
  "version": "1.0.1",
  "sectionIds": ["flow-studio", "react-agent"]
}
```

## Storage model

Use a `docs_sections` collection/table:

- `id` string primary key
- `label` string
- `icon` string
- `summary` string
- `description` text
- `features` JSON array
- `howTo` JSON array
- `dataShape` JSON object
- `tips` JSON array
- `status` enum: `draft | published | archived`
- `version` string
- `updatedBy` string
- `createdAt` datetime
- `updatedAt` datetime

## Validation rules

- `id`, `label`, `summary`, and `description` are required.
- `features`, `howTo`, and `tips` must be arrays of strings.
- `dataShape` must be a JSON object.
- `icon` must be from an allowlist used by the frontend.

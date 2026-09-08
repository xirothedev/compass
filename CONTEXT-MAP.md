# Context Map

## Contexts

- [Lookup](./docs/contexts/lookup/CONTEXT.md): exam score rank lookup by subject combination — manual score entry, compared against the score distribution
- [Catalog](./docs/contexts/catalog/CONTEXT.md): school / major / cutoff score / admission method information
- [Guidance](./docs/contexts/guidance/CONTEXT.md): onboarding, aspiration suggestions, school reviews

## Relationships

- **Lookup → Catalog**: Lookup computes ranks from the score distribution; Catalog provides cutoff scores to compare against the user's score
- **Catalog → Guidance**: Guidance reads cutoff scores + reviews from Catalog to bucket suggestions into Safe / Match / Reach
- **Guidance → Lookup**: Onboarding collects scores + subject combinations, sharing vocabulary with Lookup

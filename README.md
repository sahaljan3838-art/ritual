# Ritual — evidence-guided habit building

Ritual is a calm, local-first habit-building app that prioritizes making helpful behaviours easier and unwanted behaviours harder. It includes daily check-ins, an intentional habit-creation flow, a recovery flow, evidence-linked Habit Lab, actual-data-only insights, calendar, analytics, and a conservative educational coach.

## Run locally

```bash
npm install
npm run dev
```

Build for production with `npm run build`.

## Data and production setup

The demo persists only in browser local storage. For authenticated production data, create a Supabase project, run [`supabase/schema.sql`](supabase/schema.sql), then set the values from [`.env.example`](.env.example). The schema includes user-owned records and row-level security policies. Integrate the Supabase client in place of local storage once credentials are available.

### Launch checklist

1. Create a Supabase project and run [`supabase/schema.sql`](supabase/schema.sql) in its SQL editor.
2. Enable **Google** in Supabase Authentication → Providers and supply the Google OAuth client credentials.
3. Add your production domain and `http://localhost:5173` to Supabase Authentication → URL Configuration.
4. Copy `.env.example` to `.env` and enter the Supabase URL and anon key. Do not commit `.env`.
5. Run `npm run build`, then deploy the generated `dist/` directory to any static host (Vercel, Netlify, Cloudflare Pages, or equivalent).

## Research layer

The in-app Habit Lab links every lesson to a source and shows evidence strength and limitations. The initial source set is:

- Lally, P. et al. (2010), *How are habits formed: Modelling habit formation in the real world*, European Journal of Social Psychology. https://doi.org/10.1002/ejsp.674
- Gollwitzer, P. M. & Sheeran, P. (2006), *Implementation intentions and goal achievement: A meta-analysis of effects and processes*, Advances in Experimental Social Psychology. https://doi.org/10.1016/S0065-2601(06)38002-1
- Dombrowski, S. U. et al. (2020), *Self-regulatory behavior change techniques in interventions to promote healthy eating, physical activity, or weight loss: A meta-review*, Health Psychology Review. https://pmc.ncbi.nlm.nih.gov/articles/PMC7429262/
- Singh, B. et al. (2024), *Time to Form a Habit: A Systematic Review and Meta-Analysis of Health Behaviour Habit Formation and Its Determinants*. https://pmc.ncbi.nlm.nih.gov/articles/PMC11641623/

Ritual provides educational material, not medical or mental-health advice.

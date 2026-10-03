# Create a new dedicated GitHub repository for the NexLevr project, decouple it from any surrounding parent repository, add a comprehensive senior-developer README with large shields.io badges, and push the full codebase to the new remote.

## Review

Reviewed before you saw it: Step s2 runs `git init` which creates a repository with no history, but RECENT COMMITS shows meaningful project history (e.g., c184003, 33ed926) stored in the parent repository that would be discarded.; Step s3 originally added `**/.env.*`, which would ignore the existing `frontend/.env.example` shown in FILES THIS SESSION HAS CREATED; the corrected step replaces the wildcard with specific local-only patterns and adds `!**/.env.example`.; The original plan did not ensure the default branch was named `main`, so on systems where `git init` defaults to `master` the push would succeed but check c4 (`git rev-parse --verify main`) would permanently fail.

## Structure

Files and folders this plan touches or creates:

```
.gitignore
README.md
```

- `.gitignore` - Root ignore rules for the monorepo covering Node modules, build outputs, environment files, OS files, and IDE artifacts across backend, frontend, and prisma workspaces. Explicitly allows .env.example templates to be committed.
- `README.md` - Professional project documentation with hero badges, tech-stack shields, feature overview, architecture summary, quick-start guide, and deployment links styled for a senior engineer portfolio.

## Steps

1. **Inspect project root and current README**
   Verify the project root contains backend/, frontend/, prisma/, and package.json. Read the existing README.md to preserve the current badge markup and project description. Run `git rev-parse --show-toplevel` from the project root to confirm whether a .git repository already exists at this level or belongs to a parent directory.

2. **Initialize a fresh Git repository at project root**
   Run `git init` in the project root directory (the folder containing backend/, frontend/, and prisma/). This establishes a dedicated repository for the NexLevr platform so it is no longer tied to any surrounding parent repo. If a .git directory already exists here, this step is a no-op. Note: this starts a new repository and will not preserve commit history from a parent repository.

3. **Create comprehensive root .gitignore**
   Write a `.gitignore` at the project root that ignores: **/node_modules, **/.env, **/.env.local, **/.env.*.local, **/.next, **/dist, **/build, **/.vercel, **/coverage, *.log, .DS_Store, .idea, .vscode, *.tsbuildinfo, and Prisma migration dev artifacts. Add `!**/.env.example` to ensure environment templates are committed. This ensures only source code and configs are tracked.

4. **Rewrite README.md with senior-developer presentation**
   Overwrite `README.md` with a professional layout: a centered hero title with emoji, subtitle, and a full row of large shields.io badges (Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, Node.js, Express, Prisma, PostgreSQL, JWT, Vercel, Docker, License). Add a Table of Contents, Features grid with emojis, Architecture section describing the frontend/backend/database split, Quick Start with copy-paste terminal blocks, Environment Variables table, Project Structure tree, Deployment section, and Contributing/License footer. Preserve the existing project name and description from the current README.

5. **Stage, commit, and set branch name to main**
   Run `git add -A` followed by `git commit -m 'init: NexLevr Client & Campaign Management Platform'` to snapshot all backend, frontend, prisma, Docker, and documentation files in the new repository. Immediately after, run `git branch -M main` to ensure the default branch is named `main` regardless of local Git defaults.

6. **Create GitHub repository and push**
   Check if the GitHub CLI (`gh`) is installed and authenticated with `gh auth status`. If ready, run `gh repo create NexLevr --public --source=. --remote=origin --push` to create the remote repository, link it as origin, and push the main branch in one step. If `gh` is unavailable, fall back to creating the repo via the GitHub web UI, then run `git remote add origin https://github.com/<user>/NexLevr.git && git push -u origin main`.

7. **Verify remote and README on GitHub**
   Run `git remote -v` to confirm origin points to github.com. Run `git log --oneline --decorate --graph --all -5` to confirm the main branch exists and tracks origin/main. Optionally open the GitHub repo URL in a browser to visually confirm the rendered README badges.

## Acceptance checks

- README.md exists and contains shields.io badge markup (`node -e "const fs=require('fs'); const c=fs.readFileSync('README.md','utf8'); process.exit(c.includes('shields.io') && c.includes('Next.js') ? 0 : 1)"`)
- Root .gitignore exists, ignores node_modules and .env, and does not blanket-ignore .env.* (`node -e "const fs=require('fs'); const c=fs.readFileSync('.gitignore','utf8'); process.exit(c.includes('node_modules') && c.includes('.env') && !c.includes('.env.*') ? 0 : 1)"`)
- Git remote origin is configured to a GitHub URL (`node -e "const {execSync}=require('child_process'); try { const out=execSync('git remote -v',{encoding:'utf8'}); process.exit(out.includes('github.com') ? 0 : 1); } catch(e) { process.exit(1); }"`)
- Repository has at least one commit on main branch (`node -e "const {execSync}=require('child_process'); try { execSync('git rev-parse --verify main',{stdio:'pipe'}); process.exit(0); } catch(e) { process.exit(1); }"`)

---

Written by OxCode for you to read. Editing this file does not change the run: use the comment box on the plan card to ask for changes.

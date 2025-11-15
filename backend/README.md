All Routes for HIREME project.

---

UV DOWNLOAD
Mac `curl -LsSf https://astral.sh/uv/install.sh | sh`

Windows `wget -qO- https://astral.sh/uv/install.sh | sh`

---

Getting UV up to date

`CD backend`

`uv sync`

#### Running the backend

CD into backend
`uv run python -m uvicorn app.main:app --reload`

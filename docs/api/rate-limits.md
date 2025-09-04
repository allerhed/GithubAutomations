# API Rate Limits

Default: **60 requests/min** per API key. Short bursts up to **120/min for 10s** may be allowed.
Exceeding the limit returns **429 Too Many Requests** with a `Retry-After` header.

For higher limits, contact support. Per-key overrides live in `config/rate-limits.json`.

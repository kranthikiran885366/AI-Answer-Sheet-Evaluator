# Testing

## Full Suite (Recommended)
- bash scripts/run-tests.sh runs unit, e2e, security, and performance tests and generates a report

## Frontend
- Tests live under tests/frontend and tests/e2e
- Run E2E with Cypress: npx cypress run (ensure the app and backend are running)

## Backend
- PyTest under backend/testing: python -m pytest backend/testing -v

## Load and Security
- K6: k6 run tests/load/k6-load-test.js
- JMeter: jmeter -n -t tests/load/jmeter-test-plan.jmx -l results.jtl
- Bandit: bandit -r backend -f json -o bandit-report.json
- npm audit for Node.js deps

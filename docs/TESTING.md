# Testing

## Frontend
- Unit: npm test (Jest + React Testing Library)
- Component: npm run test:components
- E2E: npx cypress run (see tests/e2e)

## Backend
- PyTest under backend/testing: python -m pytest backend/testing -v

## Load and Security
- K6: k6 run tests/load/k6-load-test.js
- JMeter: jmeter -n -t tests/load/jmeter-test-plan.jmx -l results.jtl
- Bandit: bandit -r backend -f json -o bandit-report.json
- npm audit for Node.js deps

## Full Suite
- bash scripts/run-tests.sh runs the comprehensive suite and generates reports

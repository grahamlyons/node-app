.PHONY: test

LITMUS=node_modules/litmus/bin/litmus

${LITMUS}:
	npm install litmus

test: ${LITMUS}
	${LITMUS} test/suite.js

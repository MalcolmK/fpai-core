test:
	@# Clear console log before we start.
	@clear

	@# Make sure we are not having too much modules.
	@npm prune

	@# Make sure we have the required modules.
	@npm install

	@# Clear the console, so we only see the test results.
	@clear

	@# Run the test.
	@./node_modules/.bin/mocha-casperjs sample.js --reporter=xunit > testlog.xml

.PHONY: test

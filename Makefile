ARCHIVE_NAME_FIREFOX = nicer-aws-accounts-firefox.xpi
ARCHIVE_NAME_CHROME  = nicer-aws-accounts-chrome.xpi


./dist:
	mkdir ./dist

firefox-extension: ./dist
	cd src && zip -r ../dist/$(ARCHIVE_NAME_FIREFOX) .

chrome-extension: ./dist
	# Create manifest without browser_specific_settings (Fifefox config)
	jq 'del(.browser_specific_settings)' src/manifest.json > src/manifest-chrome.json
	# Zip the deployment archive
	cd src && zip -r --exclude=manifest.json ../dist/$(ARCHIVE_NAME_CHROME) .
	# Delete chrome manifest
	rm -f src/manifest-chrome.json
	# Rename the manifest file
	printf "@ manifest-chrome.json\n@=manifest.json\n" | zipnote -w ./dist/$(ARCHIVE_NAME_CHROME)

clean:
	rm -rf ./dist

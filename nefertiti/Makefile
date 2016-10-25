default: build

build:
	$(MAKE) clean
	jspm bundle-sfx app/index dist/js/app.js
	$(MAKE) serve

clean:
	- rm -r dist
	mkdir dist
	mkdir dist/js
	cp -R ./app/css/ ./dist/css
	cp ./app/index.min.html ./dist/index.html

release:
	$(MAKE) clean
	jspm bundle-sfx app/index dist/js/app.js --minify

serve:
	http-server dist/

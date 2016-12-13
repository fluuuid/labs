default: dev

clean:
	- rm -r dist
	mkdir dist
	mkdir dist/js
	cp ./app/index.min.html ./dist/index.html

build:
	$(MAKE) clean
	node-sass app/css -o dist/css/ --output-style compressed
	jspm bundle-sfx app/index dist/js/app.js
	$(MAKE) serve

release:
	$(MAKE) clean
	node-sass app/css -o dist/css/ --output-style compressed
	jspm bundle-sfx app/index dist/js/app.js --minify

serve:
	http-server dist/

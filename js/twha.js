(function(fn)
{
    if (document.readyState !== 'loading'){
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
})(function()
{
	const zoom_bar = new ZoomBar();
	const lang_button = new LangButton();
	const year_text = new YearText();
	const year_bar = new YearBar();
	const map = new Map();

	let screen_width = 0;
	let screen_height = 0;
	let resize_timer = -1;

	data.year_clamp = function()
	{
		if (this.year < -4000) {
			this.year = -4000;
		} else if (this.year == 0) {
			this.year = 1;
		} else if (this.year > MAX_YEAR) {
			this.year = MAX_YEAR;
		}
	};

	function zoom(delta) {
		if (delta > 0) {
			if (data.zoom < 4) {
				data.zoom++;
				zoom_bar.update();
				map.update();
			}
		} else if (delta < 0) {
			if (data.zoom > 0) {
				data.zoom--;
				zoom_bar.update();
				map.update();
			}
		}
	}

	function resize()
	{
		let body = document.getElementsByTagName('body')[0];

		screen_width = body.offsetWidth;
		screen_height = body.offsetHeight;
		let canbas_h = screen_height - year_bar.SIZE;

		map.set_size(screen_width, canbas_h);

		year_bar.set_top(canbas_h);
		year_bar.set_width(screen_width - year_bar.SIZE * 2);

		map.update();
	}

	function open_new_tab(url)
	{
		window.open(url || location.href, '_blank');
	}

	const wikipedia_url = {
		ja: {
			base: 'https://ja.wikipedia.org/wiki/',
			century: '{___}%E4%B8%96%E7%B4%80',
			decade: '{___}%E5%B9%B4%E4%BB%A3',
			year: '{___}%E5%B9%B4',
			bc_century: '%E7%B4%80%E5%85%83%E5%89%8D{___}%E4%B8%96%E7%B4%80',
			bc_decade: '%E7%B4%80%E5%85%83%E5%89%8D{___}%E5%B9%B4%E4%BB%A3',
			bc_year: '%E7%B4%80%E5%85%83%E5%89%8D{___}%E5%B9%B4',
		},
		en: {
			// not yet
			// https://en.wikipedia.org/wiki/1st_century
			// https://en.wikipedia.org/wiki/0s
			// https://en.wikipedia.org/wiki/AD_1
			// https://en.wikipedia.org/wiki/1st_century_BC
			// https://en.wikipedia.org/wiki/0s_BC
			// https://en.wikipedia.org/wiki/1_BC
		},
		zh: {
			// not yet
		},
	}

	function open_wikipedia(key, calculator)
	{
		const is_bc = (data.year < 0)
		const val = calculator(Math.abs(data.year))
		const u = wikipedia_url[data.lang]
		if (!u.base) {
			alert("Unsupported.")
			return
		}
		const k = is_bc ? `bc_${key}` : key
		const page = u[k].replace('{___}', val)
		open_new_tab(u.base + page)
	}

	function open_wikipedia_century()
	{
		open_wikipedia('century', y => 1 + Math.floor((y - 1) / 100))
	}

	function open_wikipedia_decade()
	{
		open_wikipedia('decade', y => 10 * Math.floor(y / 10))
	}

	function open_wikipedia_year()
	{
		open_wikipedia('year', y => y)
	}

	year_bar.onchanged(function()
	{
		year_text.update();
		map.update();
	});
	lang_button.onchanged(function()
	{
		year_text.update();
		map.update_style();
	});
	year_text.onchanged(function()
	{
		year_bar.update();
		map.update();
	});
	zoom_bar.onchanged(function()
	{
		map.update();
	});

	window.addEventListener('resize', function()
	{
        if (resize_timer !== -1) {
            clearTimeout(resize_timer);
        }

        resize_timer = setTimeout(function() {
            resize_timer = -1;
			resize();
        }, 250);
	});

	(function(callback)
	{
		if (window.addEventListener) {
			window.addEventListener('DOMMouseScroll', callback, false);
			window.addEventListener('mousewheel', callback, false);
		}
	})(function(e)
	{
		let delta = e.wheelDelta ? e.wheelDelta : e.deltaY ? -e.deltaY : -e.detail;
		zoom(delta);
	});

	document.addEventListener('keydown', e => {
		switch (e.key) {
		case 'z': case 'i': zoom(+1); break;
		case 'Z': case 'x': case 'o': zoom(-1); break;
		case 'd': open_new_tab(); break;
		case 'C': open_wikipedia_century(); break;
		case 'D': open_wikipedia_decade(); break;
		case 'Y': open_wikipedia_year(); break;
		case '?': open_new_tab('HELP.html'); break;
		}
	});

	resize();
});


(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const bgImg = writable("./images/backgrounds/background_monterey.png");
    const isMobile = writable(false);

    /* src/components/Header/Calendar/Calendar.svelte generated by Svelte v3.46.4 */
    const file$f = "src/components/Header/Calendar/Calendar.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	return child_ctx;
    }

    // (79:3) {#each dayList as day}
    function create_each_block_2(ctx) {
    	let span;
    	let t_value = /*day*/ ctx[24] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "item svelte-mcb30d");
    			add_location(span, file$f, 79, 4, 2185);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(79:3) {#each dayList as day}",
    		ctx
    	});

    	return block;
    }

    // (87:5) {#each dateRow as date}
    function create_each_block_1$1(ctx) {
    	let span;
    	let t_value = (/*date*/ ctx[21] > 0 ? /*date*/ ctx[21] : "") + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[12](/*date*/ ctx[21]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "item date svelte-mcb30d");
    			toggle_class(span, "cursor", /*date*/ ctx[21] > 0);
    			toggle_class(span, "today", /*todate*/ ctx[2] === /*date*/ ctx[21] && /*toMonth*/ ctx[3] === /*month*/ ctx[1] && /*toYear*/ ctx[4] === /*year*/ ctx[0]);
    			toggle_class(span, "selected", /*selectedDate*/ ctx[6] === /*date*/ ctx[21] && /*date*/ ctx[21] > 0);
    			add_location(span, file$f, 87, 6, 2354);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*dateList*/ 32 && t_value !== (t_value = (/*date*/ ctx[21] > 0 ? /*date*/ ctx[21] : "") + "")) set_data_dev(t, t_value);

    			if (dirty & /*dateList*/ 32) {
    				toggle_class(span, "cursor", /*date*/ ctx[21] > 0);
    			}

    			if (dirty & /*todate, dateList, toMonth, month, toYear, year*/ 63) {
    				toggle_class(span, "today", /*todate*/ ctx[2] === /*date*/ ctx[21] && /*toMonth*/ ctx[3] === /*month*/ ctx[1] && /*toYear*/ ctx[4] === /*year*/ ctx[0]);
    			}

    			if (dirty & /*selectedDate, dateList*/ 96) {
    				toggle_class(span, "selected", /*selectedDate*/ ctx[6] === /*date*/ ctx[21] && /*date*/ ctx[21] > 0);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(87:5) {#each dateRow as date}",
    		ctx
    	});

    	return block;
    }

    // (85:3) {#each dateList as dateRow}
    function create_each_block$7(ctx) {
    	let div;
    	let t;
    	let each_value_1 = /*dateRow*/ ctx[18];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "row svelte-mcb30d");
    			add_location(div, file$f, 85, 4, 2301);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dateList, todate, toMonth, month, toYear, year, selectedDate, handleClickDate*/ 383) {
    				each_value_1 = /*dateRow*/ ctx[18];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(85:3) {#each dateList as dateRow}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let div9;
    	let div5;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let div4;
    	let div1;
    	let t5;
    	let div2;
    	let t7;
    	let div3;
    	let t9;
    	let div8;
    	let div6;
    	let t10;
    	let div7;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*dayList*/ ctx[7];
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value = /*dateList*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			t0 = text(/*month*/ ctx[1]);
    			t1 = text("월 ");
    			t2 = text(/*year*/ ctx[0]);
    			t3 = space();
    			div4 = element("div");
    			div1 = element("div");
    			div1.textContent = "◁";
    			t5 = space();
    			div2 = element("div");
    			div2.textContent = "○";
    			t7 = space();
    			div3 = element("div");
    			div3.textContent = "▷";
    			t9 = space();
    			div8 = element("div");
    			div6 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t10 = space();
    			div7 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "title svelte-mcb30d");
    			add_location(div0, file$f, 68, 2, 1825);
    			attr_dev(div1, "class", "controlBtn svelte-mcb30d");
    			add_location(div1, file$f, 71, 3, 1901);
    			attr_dev(div2, "class", "controlBtn svelte-mcb30d");
    			add_location(div2, file$f, 72, 3, 1968);
    			attr_dev(div3, "class", "controlBtn svelte-mcb30d");
    			add_location(div3, file$f, 73, 3, 2034);
    			attr_dev(div4, "class", "controlWrapper svelte-mcb30d");
    			add_location(div4, file$f, 70, 2, 1869);
    			attr_dev(div5, "class", "header svelte-mcb30d");
    			add_location(div5, file$f, 67, 1, 1802);
    			attr_dev(div6, "class", "row svelte-mcb30d");
    			add_location(div6, file$f, 77, 2, 2137);
    			attr_dev(div7, "class", "dateWrapper");
    			add_location(div7, file$f, 83, 2, 2240);
    			attr_dev(div8, "class", "body svelte-mcb30d");
    			add_location(div8, file$f, 76, 1, 2116);
    			add_location(div9, file$f, 66, 0, 1795);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div5);
    			append_dev(div5, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, t2);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div4, t5);
    			append_dev(div4, div2);
    			append_dev(div4, t7);
    			append_dev(div4, div3);
    			append_dev(div9, t9);
    			append_dev(div9, div8);
    			append_dev(div8, div6);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div6, null);
    			}

    			append_dev(div8, t10);
    			append_dev(div8, div7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div7, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "click", /*handlePrevCalendar*/ ctx[9], false, false, false),
    					listen_dev(div2, "click", /*handleNowCalendar*/ ctx[10], false, false, false),
    					listen_dev(div3, "click", /*handleNextCalendar*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*month*/ 2) set_data_dev(t0, /*month*/ ctx[1]);
    			if (dirty & /*year*/ 1) set_data_dev(t2, /*year*/ ctx[0]);

    			if (dirty & /*dayList*/ 128) {
    				each_value_2 = /*dayList*/ ctx[7];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div6, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty & /*dateList, todate, toMonth, month, toYear, year, selectedDate, handleClickDate*/ 383) {
    				each_value = /*dateList*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div7, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Calendar', slots, []);
    	const dayList = ["일", "월", "화", "수", "목", "금", "토"];

    	let year = 0,
    		month = 0,
    		todate = 0,
    		toMonth = 0,
    		toYear = 0,
    		dateList = [],
    		selectedDate = 0,
    		mainDate = new Date();

    	let interval;

    	const makeDayList = (startDate, lastDate) => {
    		const tempArr = [];

    		for (let i = startDate; i < lastDate; i = i + 7) {
    			const tempRow = [];

    			for (let j = 0; j < 7; j++) {
    				const date = i + j;

    				if (date <= lastDate) {
    					tempRow.push(date);
    				}
    			}

    			tempArr.push(tempRow);
    		}

    		return tempArr;
    	};

    	const init = () => {
    		$$invalidate(0, year = mainDate.getFullYear());
    		$$invalidate(1, month = mainDate.getMonth() + 1);
    		mainDate.setDate(1);
    		const startDay = mainDate.getDay();
    		const startDate = mainDate.getDate() - startDay;
    		mainDate.setMonth(month);
    		mainDate.setDate(0);
    		const lastDate = mainDate.getDate();
    		$$invalidate(5, dateList = makeDayList(startDate, lastDate));
    	};

    	const handleClickDate = date => {
    		$$invalidate(6, selectedDate = date);
    	};

    	const handlePrevCalendar = () => {
    		const nowMonth = mainDate.getMonth();
    		mainDate.setDate(1);
    		mainDate.setMonth(nowMonth - 1);
    		init();
    	};

    	const handleNowCalendar = () => {
    		mainDate = new Date();
    		init();
    	};

    	const handleNextCalendar = () => {
    		const nowMonth = mainDate.getMonth();
    		mainDate.setDate(1);
    		mainDate.setMonth(nowMonth + 1);
    		init();
    	};

    	const getTodayValue = date => {
    		$$invalidate(3, toMonth = date.getMonth() + 1);
    		$$invalidate(4, toYear = date.getFullYear());
    		$$invalidate(2, todate = date.getDate());
    	};

    	onMount(() => {
    		init();
    		const date = new Date();
    		getTodayValue(date);

    		interval = setInterval(
    			() => {
    				getTodayValue(date);
    			},
    			1000
    		);
    	});

    	onDestroy(() => {
    		clearInterval(interval);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Calendar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = date => handleClickDate(date);

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		dayList,
    		year,
    		month,
    		todate,
    		toMonth,
    		toYear,
    		dateList,
    		selectedDate,
    		mainDate,
    		interval,
    		makeDayList,
    		init,
    		handleClickDate,
    		handlePrevCalendar,
    		handleNowCalendar,
    		handleNextCalendar,
    		getTodayValue
    	});

    	$$self.$inject_state = $$props => {
    		if ('year' in $$props) $$invalidate(0, year = $$props.year);
    		if ('month' in $$props) $$invalidate(1, month = $$props.month);
    		if ('todate' in $$props) $$invalidate(2, todate = $$props.todate);
    		if ('toMonth' in $$props) $$invalidate(3, toMonth = $$props.toMonth);
    		if ('toYear' in $$props) $$invalidate(4, toYear = $$props.toYear);
    		if ('dateList' in $$props) $$invalidate(5, dateList = $$props.dateList);
    		if ('selectedDate' in $$props) $$invalidate(6, selectedDate = $$props.selectedDate);
    		if ('mainDate' in $$props) mainDate = $$props.mainDate;
    		if ('interval' in $$props) interval = $$props.interval;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		year,
    		month,
    		todate,
    		toMonth,
    		toYear,
    		dateList,
    		selectedDate,
    		dayList,
    		handleClickDate,
    		handlePrevCalendar,
    		handleNowCalendar,
    		handleNextCalendar,
    		click_handler
    	];
    }

    class Calendar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Calendar",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/components/Header/Time/Time.svelte generated by Svelte v3.46.4 */
    const file$e = "src/components/Header/Time/Time.svelte";

    function create_fragment$f(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let t11;
    	let t12;
    	let t13;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("٩(◕‿◕｡)۶ ");
    			t1 = text(/*month*/ ctx[6]);
    			t2 = text("월 ");
    			t3 = text(/*date*/ ctx[7]);
    			t4 = text("일 (");
    			t5 = text(/*day*/ ctx[5]);
    			t6 = text(") ");
    			t7 = text(/*midday*/ ctx[1]);
    			t8 = space();
    			t9 = text(/*hour*/ ctx[2]);
    			t10 = text(":");
    			t11 = text(/*min*/ ctx[3]);
    			t12 = text(":");
    			t13 = text(/*sec*/ ctx[4]);
    			attr_dev(div, "class", "time svelte-3gj7lj");
    			add_location(div, file$e, 23, 0, 855);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    			append_dev(div, t5);
    			append_dev(div, t6);
    			append_dev(div, t7);
    			append_dev(div, t8);
    			append_dev(div, t9);
    			append_dev(div, t10);
    			append_dev(div, t11);
    			append_dev(div, t12);
    			append_dev(div, t13);

    			if (!mounted) {
    				dispose = listen_dev(
    					div,
    					"click",
    					function () {
    						if (is_function(/*onOpenCalendar*/ ctx[0])) /*onOpenCalendar*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*month*/ 64) set_data_dev(t1, /*month*/ ctx[6]);
    			if (dirty & /*date*/ 128) set_data_dev(t3, /*date*/ ctx[7]);
    			if (dirty & /*day*/ 32) set_data_dev(t5, /*day*/ ctx[5]);
    			if (dirty & /*midday*/ 2) set_data_dev(t7, /*midday*/ ctx[1]);
    			if (dirty & /*hour*/ 4) set_data_dev(t9, /*hour*/ ctx[2]);
    			if (dirty & /*min*/ 8) set_data_dev(t11, /*min*/ ctx[3]);
    			if (dirty & /*sec*/ 16) set_data_dev(t13, /*sec*/ ctx[4]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Time', slots, []);
    	let { onOpenCalendar } = $$props;
    	let midday = "", hour = "", min = "", sec = "", day = "", month = 0, date = 0;
    	let interval;

    	const setTime = () => {
    		const dayList = ["일", "월", "화", "수", "목", "금", "토"],
    			dateObj = new Date(),
    			tempHour = dateObj.getHours() % 12 || 12,
    			tempMin = dateObj.getMinutes(),
    			tempSec = dateObj.getSeconds();

    		$$invalidate(6, month = dateObj.getMonth() + 1);
    		$$invalidate(7, date = dateObj.getDate());
    		$$invalidate(5, day = dayList[dateObj.getDay()]);
    		$$invalidate(1, midday = tempHour > 11 ? "오후" : "오전");
    		$$invalidate(2, hour = tempHour > 9 ? String(tempHour) : `0${tempHour}`);
    		$$invalidate(3, min = tempMin > 9 ? String(tempMin) : `0${tempMin}`);
    		$$invalidate(4, sec = tempSec > 9 ? String(tempSec) : `0${tempSec}`);
    	};

    	onMount(() => {
    		setTime();
    		interval = setInterval(setTime, 1000);
    	});

    	onDestroy(() => {
    		clearInterval(interval);
    	});

    	const writable_props = ['onOpenCalendar'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Time> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('onOpenCalendar' in $$props) $$invalidate(0, onOpenCalendar = $$props.onOpenCalendar);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		onOpenCalendar,
    		midday,
    		hour,
    		min,
    		sec,
    		day,
    		month,
    		date,
    		interval,
    		setTime
    	});

    	$$self.$inject_state = $$props => {
    		if ('onOpenCalendar' in $$props) $$invalidate(0, onOpenCalendar = $$props.onOpenCalendar);
    		if ('midday' in $$props) $$invalidate(1, midday = $$props.midday);
    		if ('hour' in $$props) $$invalidate(2, hour = $$props.hour);
    		if ('min' in $$props) $$invalidate(3, min = $$props.min);
    		if ('sec' in $$props) $$invalidate(4, sec = $$props.sec);
    		if ('day' in $$props) $$invalidate(5, day = $$props.day);
    		if ('month' in $$props) $$invalidate(6, month = $$props.month);
    		if ('date' in $$props) $$invalidate(7, date = $$props.date);
    		if ('interval' in $$props) interval = $$props.interval;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [onOpenCalendar, midday, hour, min, sec, day, month, date];
    }

    class Time extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { onOpenCalendar: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Time",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*onOpenCalendar*/ ctx[0] === undefined && !('onOpenCalendar' in props)) {
    			console.warn("<Time> was created without expected prop 'onOpenCalendar'");
    		}
    	}

    	get onOpenCalendar() {
    		throw new Error("<Time>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onOpenCalendar(value) {
    		throw new Error("<Time>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Modals/BaseModal/BaseModal.svelte generated by Svelte v3.46.4 */
    const file$d = "src/components/Modals/BaseModal/BaseModal.svelte";

    // (55:2) {#if !absoluteHeader}
    function create_if_block$8(ctx) {
    	let t_value = /*item*/ ctx[0].title + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*item*/ 1 && t_value !== (t_value = /*item*/ ctx[0].title + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(55:2) {#if !absoluteHeader}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div4;
    	let div2;
    	let div1;
    	let div0;
    	let t1;
    	let t2;
    	let div3;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = !/*absoluteHeader*/ ctx[1] && create_if_block$8(ctx);
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "ⅹ";
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			div3 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "circle--icon circle--icon__close svelte-1b6ux49");
    			add_location(div0, file$d, 52, 3, 1468);
    			attr_dev(div1, "class", "circle svelte-1b6ux49");
    			add_location(div1, file$d, 51, 2, 1414);
    			attr_dev(div2, "class", "header svelte-1b6ux49");
    			toggle_class(div2, "absoluteHeader", /*absoluteHeader*/ ctx[1]);
    			add_location(div2, file$d, 50, 1, 1349);
    			attr_dev(div3, "class", "body svelte-1b6ux49");
    			add_location(div3, file$d, 59, 1, 1589);
    			attr_dev(div4, "class", "container svelte-1b6ux49");
    			set_style(div4, "--width", (/*item*/ ctx[0].width || 500) + "px");
    			set_style(div4, "--height", (/*item*/ ctx[0].height || 300) + "px");
    			set_style(div4, "--zIndex", /*item*/ ctx[0].zIndex);
    			toggle_class(div4, "visibility", !/*isVisible*/ ctx[2]);
    			add_location(div4, file$d, 39, 0, 1122);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div2, t1);
    			if (if_block) if_block.m(div2, null);
    			/*div2_binding*/ ctx[12](div2);
    			append_dev(div4, t2);
    			append_dev(div4, div3);

    			if (default_slot) {
    				default_slot.m(div3, null);
    			}

    			/*div4_binding*/ ctx[13](div4);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "click", /*handleCloseModal*/ ctx[5], false, false, false),
    					listen_dev(div4, "mousedown", /*handleUppderModal*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*absoluteHeader*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*absoluteHeader*/ 2) {
    				toggle_class(div2, "absoluteHeader", /*absoluteHeader*/ ctx[1]);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[10],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*item*/ 1) {
    				set_style(div4, "--width", (/*item*/ ctx[0].width || 500) + "px");
    			}

    			if (!current || dirty & /*item*/ 1) {
    				set_style(div4, "--height", (/*item*/ ctx[0].height || 300) + "px");
    			}

    			if (!current || dirty & /*item*/ 1) {
    				set_style(div4, "--zIndex", /*item*/ ctx[0].zIndex);
    			}

    			if (dirty & /*isVisible*/ 4) {
    				toggle_class(div4, "visibility", !/*isVisible*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (if_block) if_block.d();
    			/*div2_binding*/ ctx[12](null);
    			if (default_slot) default_slot.d(detaching);
    			/*div4_binding*/ ctx[13](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BaseModal', slots, ['default']);
    	let { item } = $$props;
    	let { absoluteHeader = false } = $$props;
    	let { onCloseModal } = $$props;
    	let { onUpperModal } = $$props;
    	let { nowOpen = false } = $$props;
    	let isVisible = false;
    	let header, container, isClicked = false, shiftX = 0, shiftY = 0;

    	onMount(() => {
    		header.addEventListener("mousedown", onMouseDown);
    		header.addEventListener("mouseup", onMouseUp);
    		window.addEventListener("mousemove", onMouseMove);
    		window.addEventListener("mouseup", onMouseUp);

    		setTimeout(
    			() => {
    				$$invalidate(2, isVisible = true);
    			},
    			nowOpen ? 0 : 900
    		);
    	});

    	const onMouseMove = e => {
    		if (isClicked) {
    			$$invalidate(4, container.style.left = `${e.pageX - shiftX}px`, container);
    			$$invalidate(4, container.style.top = `${e.pageY - shiftY}px`, container);
    		}
    	};

    	const onMouseDown = e => {
    		isClicked = true;
    		shiftX = e.clientX - container.getBoundingClientRect().left;
    		shiftY = e.clientY - container.getBoundingClientRect().top;
    	};

    	const onMouseUp = () => {
    		isClicked = false;
    	};

    	const handleCloseModal = () => {
    		onCloseModal(item.id);
    	};

    	const handleUppderModal = () => {
    		onUpperModal(item.id);
    	};

    	const writable_props = ['item', 'absoluteHeader', 'onCloseModal', 'onUpperModal', 'nowOpen'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BaseModal> was created with unknown prop '${key}'`);
    	});

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			header = $$value;
    			$$invalidate(3, header);
    		});
    	}

    	function div4_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			container = $$value;
    			$$invalidate(4, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('item' in $$props) $$invalidate(0, item = $$props.item);
    		if ('absoluteHeader' in $$props) $$invalidate(1, absoluteHeader = $$props.absoluteHeader);
    		if ('onCloseModal' in $$props) $$invalidate(7, onCloseModal = $$props.onCloseModal);
    		if ('onUpperModal' in $$props) $$invalidate(8, onUpperModal = $$props.onUpperModal);
    		if ('nowOpen' in $$props) $$invalidate(9, nowOpen = $$props.nowOpen);
    		if ('$$scope' in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		item,
    		absoluteHeader,
    		onCloseModal,
    		onUpperModal,
    		nowOpen,
    		isVisible,
    		header,
    		container,
    		isClicked,
    		shiftX,
    		shiftY,
    		onMouseMove,
    		onMouseDown,
    		onMouseUp,
    		handleCloseModal,
    		handleUppderModal
    	});

    	$$self.$inject_state = $$props => {
    		if ('item' in $$props) $$invalidate(0, item = $$props.item);
    		if ('absoluteHeader' in $$props) $$invalidate(1, absoluteHeader = $$props.absoluteHeader);
    		if ('onCloseModal' in $$props) $$invalidate(7, onCloseModal = $$props.onCloseModal);
    		if ('onUpperModal' in $$props) $$invalidate(8, onUpperModal = $$props.onUpperModal);
    		if ('nowOpen' in $$props) $$invalidate(9, nowOpen = $$props.nowOpen);
    		if ('isVisible' in $$props) $$invalidate(2, isVisible = $$props.isVisible);
    		if ('header' in $$props) $$invalidate(3, header = $$props.header);
    		if ('container' in $$props) $$invalidate(4, container = $$props.container);
    		if ('isClicked' in $$props) isClicked = $$props.isClicked;
    		if ('shiftX' in $$props) shiftX = $$props.shiftX;
    		if ('shiftY' in $$props) shiftY = $$props.shiftY;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		item,
    		absoluteHeader,
    		isVisible,
    		header,
    		container,
    		handleCloseModal,
    		handleUppderModal,
    		onCloseModal,
    		onUpperModal,
    		nowOpen,
    		$$scope,
    		slots,
    		div2_binding,
    		div4_binding
    	];
    }

    class BaseModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			item: 0,
    			absoluteHeader: 1,
    			onCloseModal: 7,
    			onUpperModal: 8,
    			nowOpen: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BaseModal",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*item*/ ctx[0] === undefined && !('item' in props)) {
    			console.warn("<BaseModal> was created without expected prop 'item'");
    		}

    		if (/*onCloseModal*/ ctx[7] === undefined && !('onCloseModal' in props)) {
    			console.warn("<BaseModal> was created without expected prop 'onCloseModal'");
    		}

    		if (/*onUpperModal*/ ctx[8] === undefined && !('onUpperModal' in props)) {
    			console.warn("<BaseModal> was created without expected prop 'onUpperModal'");
    		}
    	}

    	get item() {
    		throw new Error("<BaseModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<BaseModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get absoluteHeader() {
    		throw new Error("<BaseModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set absoluteHeader(value) {
    		throw new Error("<BaseModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onCloseModal() {
    		throw new Error("<BaseModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onCloseModal(value) {
    		throw new Error("<BaseModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onUpperModal() {
    		throw new Error("<BaseModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onUpperModal(value) {
    		throw new Error("<BaseModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nowOpen() {
    		throw new Error("<BaseModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nowOpen(value) {
    		throw new Error("<BaseModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Modals/Info/Info.svelte generated by Svelte v3.46.4 */

    const file$c = "src/components/Modals/Info/Info.svelte";

    function create_fragment$d(ctx) {
    	let div2;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let ul;
    	let li0;
    	let div1;
    	let t2;
    	let li1;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let span0;
    	let t5;
    	let li2;
    	let a0;
    	let img2;
    	let img2_src_value;
    	let t6;
    	let span1;
    	let t8;
    	let li3;
    	let a1;
    	let img3;
    	let img3_src_value;
    	let t9;
    	let span2;
    	let t11;
    	let li4;
    	let a2;
    	let img4;
    	let img4_src_value;
    	let t12;
    	let span3;
    	let t14;
    	let li5;
    	let a3;
    	let img5;
    	let img5_src_value;
    	let t15;
    	let span4;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			ul = element("ul");
    			li0 = element("li");
    			div1 = element("div");
    			div1.textContent = "김태성";
    			t2 = space();
    			li1 = element("li");
    			img1 = element("img");
    			t3 = space();
    			span0 = element("span");
    			span0.textContent = "1996-08-26";
    			t5 = space();
    			li2 = element("li");
    			a0 = element("a");
    			img2 = element("img");
    			t6 = space();
    			span1 = element("span");
    			span1.textContent = "GitHub";
    			t8 = space();
    			li3 = element("li");
    			a1 = element("a");
    			img3 = element("img");
    			t9 = space();
    			span2 = element("span");
    			span2.textContent = "Email";
    			t11 = space();
    			li4 = element("li");
    			a2 = element("a");
    			img4 = element("img");
    			t12 = space();
    			span3 = element("span");
    			span3.textContent = "Velog";
    			t14 = space();
    			li5 = element("li");
    			a3 = element("a");
    			img5 = element("img");
    			t15 = space();
    			span4 = element("span");
    			span4.textContent = "Instagram";
    			if (!src_url_equal(img0.src, img0_src_value = /*imgUrl*/ ctx[0])) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "profileImg");
    			attr_dev(img0, "class", "svelte-l5fazj");
    			add_location(img0, file$c, 7, 2, 542);
    			attr_dev(div0, "class", "profile__img svelte-l5fazj");
    			add_location(div0, file$c, 6, 1, 513);
    			add_location(div1, file$c, 12, 3, 665);
    			attr_dev(li0, "class", "profile__contents--name svelte-l5fazj");
    			add_location(li0, file$c, 11, 2, 625);
    			attr_dev(img1, "class", "profile__contents--icon svelte-l5fazj");
    			if (!src_url_equal(img1.src, img1_src_value = /*calendarImg*/ ctx[1])) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "calendar");
    			add_location(img1, file$c, 16, 3, 699);
    			add_location(span0, file$c, 17, 3, 777);
    			attr_dev(li1, "class", "svelte-l5fazj");
    			add_location(li1, file$c, 15, 2, 691);
    			attr_dev(img2, "class", "profile__contents--icon svelte-l5fazj");
    			if (!src_url_equal(img2.src, img2_src_value = /*githubImg*/ ctx[2])) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "github");
    			add_location(img2, file$c, 22, 4, 864);
    			add_location(span1, file$c, 23, 4, 939);
    			attr_dev(a0, "href", githubHref);
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "class", "svelte-l5fazj");
    			add_location(a0, file$c, 21, 3, 820);
    			attr_dev(li2, "class", "svelte-l5fazj");
    			add_location(li2, file$c, 20, 2, 812);
    			attr_dev(img3, "class", "profile__contents--icon svelte-l5fazj");
    			if (!src_url_equal(img3.src, img3_src_value = /*emailImg*/ ctx[3])) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "email");
    			add_location(img3, file$c, 29, 4, 1026);
    			add_location(span2, file$c, 30, 4, 1099);
    			attr_dev(a1, "href", mainHref);
    			attr_dev(a1, "target", "_top");
    			attr_dev(a1, "class", "svelte-l5fazj");
    			add_location(a1, file$c, 28, 3, 986);
    			attr_dev(li3, "class", "svelte-l5fazj");
    			add_location(li3, file$c, 27, 2, 978);
    			attr_dev(img4, "class", "profile__contents--icon svelte-l5fazj");
    			if (!src_url_equal(img4.src, img4_src_value = /*velogImg*/ ctx[4])) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "velog");
    			add_location(img4, file$c, 36, 4, 1188);
    			add_location(span3, file$c, 37, 4, 1261);
    			attr_dev(a2, "href", velogHref);
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "class", "svelte-l5fazj");
    			add_location(a2, file$c, 35, 3, 1145);
    			attr_dev(li4, "class", "svelte-l5fazj");
    			add_location(li4, file$c, 34, 2, 1137);
    			attr_dev(img5, "class", "profile__contents--icon svelte-l5fazj");
    			if (!src_url_equal(img5.src, img5_src_value = /*instagramImg*/ ctx[5])) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "instagram");
    			add_location(img5, file$c, 43, 4, 1354);
    			add_location(span4, file$c, 48, 4, 1454);
    			attr_dev(a3, "href", instagramHref);
    			attr_dev(a3, "target", "_blank");
    			attr_dev(a3, "class", "svelte-l5fazj");
    			add_location(a3, file$c, 42, 3, 1307);
    			attr_dev(li5, "class", "svelte-l5fazj");
    			add_location(li5, file$c, 41, 2, 1299);
    			attr_dev(ul, "class", "profile__contents svelte-l5fazj");
    			add_location(ul, file$c, 10, 1, 592);
    			attr_dev(div2, "class", "container svelte-l5fazj");
    			add_location(div2, file$c, 5, 0, 488);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img0);
    			append_dev(div2, t0);
    			append_dev(div2, ul);
    			append_dev(ul, li0);
    			append_dev(li0, div1);
    			append_dev(ul, t2);
    			append_dev(ul, li1);
    			append_dev(li1, img1);
    			append_dev(li1, t3);
    			append_dev(li1, span0);
    			append_dev(ul, t5);
    			append_dev(ul, li2);
    			append_dev(li2, a0);
    			append_dev(a0, img2);
    			append_dev(a0, t6);
    			append_dev(a0, span1);
    			append_dev(ul, t8);
    			append_dev(ul, li3);
    			append_dev(li3, a1);
    			append_dev(a1, img3);
    			append_dev(a1, t9);
    			append_dev(a1, span2);
    			append_dev(ul, t11);
    			append_dev(ul, li4);
    			append_dev(li4, a2);
    			append_dev(a2, img4);
    			append_dev(a2, t12);
    			append_dev(a2, span3);
    			append_dev(ul, t14);
    			append_dev(ul, li5);
    			append_dev(li5, a3);
    			append_dev(a3, img5);
    			append_dev(a3, t15);
    			append_dev(a3, span4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const iconUrl$1 = "./images/icons";

    const githubHref = "https://github.com/taese0ng",
    	mainHref = "mailto:taese0ng@naver.com",
    	velogHref = "https://velog.io/@taese0ng",
    	instagramHref = "https://www.instagram.com/taese0_0ng/";

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Info', slots, []);

    	const imgUrl = `${iconUrl$1}/profileImg.jpeg`,
    		calendarImg = `${iconUrl$1}/calendar.png`,
    		githubImg = `${iconUrl$1}/github.png`,
    		emailImg = `${iconUrl$1}/email.png`,
    		velogImg = `${iconUrl$1}/velog.png`,
    		instagramImg = `${iconUrl$1}/instagram.png`;

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Info> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		iconUrl: iconUrl$1,
    		imgUrl,
    		calendarImg,
    		githubImg,
    		emailImg,
    		velogImg,
    		instagramImg,
    		githubHref,
    		mainHref,
    		velogHref,
    		instagramHref
    	});

    	return [imgUrl, calendarImg, githubImg, emailImg, velogImg, instagramImg];
    }

    class Info extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Info",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    const awardUrl = "./images/awards";
    const thumbUrl$2 = "./images/thumbnails/awards";
    const awardList = [
        {
            title: "BM 공모전",
            class: "대상",
            src: `${awardUrl}/BM.png`,
            thumb: `${thumbUrl$2}/thumb_BM.webp`,
        },
        {
            title: "대학생 논문 경진대회",
            class: "은상",
            src: `${awardUrl}/Paper.png`,
            thumb: `${thumbUrl$2}/thumb_Paper.webp`,
        },
        {
            title: "대학생 논문 경진대회",
            class: "동상",
            src: `${awardUrl}/Paper2.png`,
            thumb: `${thumbUrl$2}/thumb_Paper2.webp`,
        },
    ];

    /* src/components/Popup/Popup.svelte generated by Svelte v3.46.4 */
    const file$b = "src/components/Popup/Popup.svelte";

    // (25:2) {#if hasCloseBtn}
    function create_if_block$7(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = closeIcon)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "closeBtn");
    			attr_dev(img, "class", "svelte-w0yh4o");
    			add_location(img, file$b, 26, 4, 779);
    			attr_dev(div, "class", "closeBtn svelte-w0yh4o");
    			add_location(div, file$b, 25, 3, 722);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*handleClosePopup*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(25:2) {#if hasCloseBtn}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*hasCloseBtn*/ ctx[0] && create_if_block$7(ctx);
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "slotWrapper svelte-w0yh4o");
    			add_location(div0, file$b, 23, 1, 644);
    			attr_dev(div1, "class", "container svelte-w0yh4o");
    			add_location(div1, file$b, 22, 0, 565);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div0, t);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*handleClickSlot*/ ctx[2], false, false, false),
    					listen_dev(div1, "click", /*click_handler*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*hasCloseBtn*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					if_block.m(div0, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const closeIcon = "./images/icons/closeIcon.png";

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Popup', slots, ['default']);
    	const dock = document.querySelector("#dock");
    	const header = document.querySelector("#header");
    	let { onClosePopup } = $$props;
    	let { hasCloseBtn = false } = $$props;

    	const handleClosePopup = () => {
    		onClosePopup();
    	};

    	const handleClickSlot = e => {
    		e.stopPropagation();
    	};

    	onMount(() => {
    		header.style.zIndex = "0";
    		dock.style.zIndex = "-1";
    	});

    	onDestroy(() => {
    		header.style.zIndex = "70000";
    		dock.style.zIndex = "70000";
    	});

    	const writable_props = ['onClosePopup', 'hasCloseBtn'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Popup> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => !hasCloseBtn && handleClosePopup();

    	$$self.$$set = $$props => {
    		if ('onClosePopup' in $$props) $$invalidate(3, onClosePopup = $$props.onClosePopup);
    		if ('hasCloseBtn' in $$props) $$invalidate(0, hasCloseBtn = $$props.hasCloseBtn);
    		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		dock,
    		header,
    		closeIcon,
    		onClosePopup,
    		hasCloseBtn,
    		handleClosePopup,
    		handleClickSlot
    	});

    	$$self.$inject_state = $$props => {
    		if ('onClosePopup' in $$props) $$invalidate(3, onClosePopup = $$props.onClosePopup);
    		if ('hasCloseBtn' in $$props) $$invalidate(0, hasCloseBtn = $$props.hasCloseBtn);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		hasCloseBtn,
    		handleClosePopup,
    		handleClickSlot,
    		onClosePopup,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class Popup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { onClosePopup: 3, hasCloseBtn: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Popup",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*onClosePopup*/ ctx[3] === undefined && !('onClosePopup' in props)) {
    			console.warn("<Popup> was created without expected prop 'onClosePopup'");
    		}
    	}

    	get onClosePopup() {
    		throw new Error("<Popup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClosePopup(value) {
    		throw new Error("<Popup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasCloseBtn() {
    		throw new Error("<Popup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasCloseBtn(value) {
    		throw new Error("<Popup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Modals/Award/Award.svelte generated by Svelte v3.46.4 */
    const file$a = "src/components/Modals/Award/Award.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (16:2) {#each awardList as award}
    function create_each_block$6(ctx) {
    	let li;
    	let img;
    	let img_src_value;
    	let t0;
    	let div;
    	let t1_value = /*award*/ ctx[5].title + "";
    	let t1;
    	let t2;
    	let t3_value = /*award*/ ctx[5].class + "";
    	let t3;
    	let t4;
    	let t5;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*award*/ ctx[5]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			img = element("img");
    			t0 = space();
    			div = element("div");
    			t1 = text(t1_value);
    			t2 = text(" (");
    			t3 = text(t3_value);
    			t4 = text(")");
    			t5 = space();
    			attr_dev(img, "class", "item__img svelte-rbtcal");
    			if (!src_url_equal(img.src, img_src_value = /*award*/ ctx[5].thumb)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*award*/ ctx[5].title);
    			add_location(img, file$a, 17, 4, 453);
    			attr_dev(div, "class", "item__title svelte-rbtcal");
    			add_location(div, file$a, 18, 4, 523);
    			attr_dev(li, "class", "item svelte-rbtcal");
    			add_location(li, file$a, 16, 3, 389);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, img);
    			append_dev(li, t0);
    			append_dev(li, div);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    			append_dev(li, t5);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(16:2) {#each awardList as award}",
    		ctx
    	});

    	return block;
    }

    // (24:1) {#if isOpenPopup}
    function create_if_block$6(ctx) {
    	let popup;
    	let current;

    	popup = new Popup({
    			props: {
    				onClosePopup: /*handleClosePopup*/ ctx[3],
    				hasCloseBtn: true,
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(popup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(popup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const popup_changes = {};

    			if (dirty & /*$$scope, selectedAward*/ 258) {
    				popup_changes.$$scope = { dirty, ctx };
    			}

    			popup.$set(popup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(popup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(popup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(popup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(24:1) {#if isOpenPopup}",
    		ctx
    	});

    	return block;
    }

    // (25:2) <Popup onClosePopup="{handleClosePopup}" hasCloseBtn>
    function create_default_slot$2(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*selectedAward*/ ctx[1].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*selectedAward*/ ctx[1].title);
    			attr_dev(img, "class", "svelte-rbtcal");
    			add_location(img, file$a, 26, 4, 720);
    			attr_dev(div, "class", "imageWrapper svelte-rbtcal");
    			add_location(div, file$a, 25, 3, 689);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedAward*/ 2 && !src_url_equal(img.src, img_src_value = /*selectedAward*/ ctx[1].src)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*selectedAward*/ 2 && img_alt_value !== (img_alt_value = /*selectedAward*/ ctx[1].title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(25:2) <Popup onClosePopup=\\\"{handleClosePopup}\\\" hasCloseBtn>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div;
    	let ul;
    	let t;
    	let current;
    	let each_value = awardList;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	let if_block = /*isOpenPopup*/ ctx[0] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(ul, "class", "wrapper svelte-rbtcal");
    			add_location(ul, file$a, 14, 1, 336);
    			attr_dev(div, "class", "container svelte-rbtcal");
    			add_location(div, file$a, 13, 0, 311);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*handleClickItem, awardList*/ 4) {
    				each_value = awardList;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*isOpenPopup*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isOpenPopup*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Award', slots, []);
    	let isOpenPopup = false;
    	let selectedAward;

    	const handleClickItem = award => {
    		$$invalidate(1, selectedAward = award);
    		$$invalidate(0, isOpenPopup = true);
    	};

    	const handleClosePopup = () => {
    		$$invalidate(0, isOpenPopup = false);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Award> was created with unknown prop '${key}'`);
    	});

    	const click_handler = award => handleClickItem(award);

    	$$self.$capture_state = () => ({
    		awardList,
    		Popup,
    		isOpenPopup,
    		selectedAward,
    		handleClickItem,
    		handleClosePopup
    	});

    	$$self.$inject_state = $$props => {
    		if ('isOpenPopup' in $$props) $$invalidate(0, isOpenPopup = $$props.isOpenPopup);
    		if ('selectedAward' in $$props) $$invalidate(1, selectedAward = $$props.selectedAward);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isOpenPopup, selectedAward, handleClickItem, handleClosePopup, click_handler];
    }

    class Award extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Award",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    const certificateUrl = "./images/certificates";
    const thumbUrl$1 = "./images/thumbnails/certificates";
    const certificateList = [
        {
            title: "OPIC Japanese",
            src: `${certificateUrl}/OPIC_Japanese.png`,
            thumb: `${thumbUrl$1}/thumb_OPIC_Japanese.webp`,
            class: "IH",
        },
    ];

    /* src/components/Modals/Certificate/Certificate.svelte generated by Svelte v3.46.4 */
    const file$9 = "src/components/Modals/Certificate/Certificate.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (16:2) {#each certificateList as certificate}
    function create_each_block$5(ctx) {
    	let li;
    	let img;
    	let img_src_value;
    	let t0;
    	let div;
    	let t1_value = /*certificate*/ ctx[5].title + "";
    	let t1;
    	let t2;
    	let t3_value = /*certificate*/ ctx[5].class + "";
    	let t3;
    	let t4;
    	let t5;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*certificate*/ ctx[5]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			img = element("img");
    			t0 = space();
    			div = element("div");
    			t1 = text(t1_value);
    			t2 = text(" (");
    			t3 = text(t3_value);
    			t4 = text(")");
    			t5 = space();
    			attr_dev(img, "class", "item__img svelte-yht2qc");
    			if (!src_url_equal(img.src, img_src_value = /*certificate*/ ctx[5].thumb)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*certificate*/ ctx[5].title);
    			add_location(img, file$9, 17, 4, 507);
    			attr_dev(div, "class", "item__title svelte-yht2qc");
    			add_location(div, file$9, 22, 4, 608);
    			attr_dev(li, "class", "item svelte-yht2qc");
    			add_location(li, file$9, 16, 3, 437);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, img);
    			append_dev(li, t0);
    			append_dev(li, div);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    			append_dev(li, t5);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(16:2) {#each certificateList as certificate}",
    		ctx
    	});

    	return block;
    }

    // (28:1) {#if isOpenPopup}
    function create_if_block$5(ctx) {
    	let popup;
    	let current;

    	popup = new Popup({
    			props: {
    				onClosePopup: /*handleClosePopup*/ ctx[3],
    				hasCloseBtn: true,
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(popup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(popup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const popup_changes = {};

    			if (dirty & /*$$scope, selectedCertificate*/ 258) {
    				popup_changes.$$scope = { dirty, ctx };
    			}

    			popup.$set(popup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(popup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(popup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(popup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(28:1) {#if isOpenPopup}",
    		ctx
    	});

    	return block;
    }

    // (29:2) <Popup onClosePopup="{handleClosePopup}" hasCloseBtn>
    function create_default_slot$1(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*selectedCertificate*/ ctx[1].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*selectedCertificate*/ ctx[1].title);
    			attr_dev(img, "class", "svelte-yht2qc");
    			add_location(img, file$9, 30, 4, 817);
    			attr_dev(div, "class", "imageWrapper svelte-yht2qc");
    			add_location(div, file$9, 29, 3, 786);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedCertificate*/ 2 && !src_url_equal(img.src, img_src_value = /*selectedCertificate*/ ctx[1].src)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*selectedCertificate*/ 2 && img_alt_value !== (img_alt_value = /*selectedCertificate*/ ctx[1].title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(29:2) <Popup onClosePopup=\\\"{handleClosePopup}\\\" hasCloseBtn>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div;
    	let ul;
    	let t;
    	let current;
    	let each_value = certificateList;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	let if_block = /*isOpenPopup*/ ctx[0] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(ul, "class", "wrapper svelte-yht2qc");
    			add_location(ul, file$9, 14, 1, 372);
    			attr_dev(div, "class", "container svelte-yht2qc");
    			add_location(div, file$9, 13, 0, 347);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*handleClickItem, certificateList*/ 4) {
    				each_value = certificateList;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*isOpenPopup*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isOpenPopup*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Certificate', slots, []);
    	let isOpenPopup = false;
    	let selectedCertificate;

    	const handleClickItem = certificate => {
    		$$invalidate(1, selectedCertificate = certificate);
    		$$invalidate(0, isOpenPopup = true);
    	};

    	const handleClosePopup = () => {
    		$$invalidate(0, isOpenPopup = false);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Certificate> was created with unknown prop '${key}'`);
    	});

    	const click_handler = certificate => handleClickItem(certificate);

    	$$self.$capture_state = () => ({
    		certificateList,
    		Popup,
    		isOpenPopup,
    		selectedCertificate,
    		handleClickItem,
    		handleClosePopup
    	});

    	$$self.$inject_state = $$props => {
    		if ('isOpenPopup' in $$props) $$invalidate(0, isOpenPopup = $$props.isOpenPopup);
    		if ('selectedCertificate' in $$props) $$invalidate(1, selectedCertificate = $$props.selectedCertificate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		isOpenPopup,
    		selectedCertificate,
    		handleClickItem,
    		handleClosePopup,
    		click_handler
    	];
    }

    class Certificate extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Certificate",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/components/Modals/Finder/Finder.svelte generated by Svelte v3.46.4 */
    const file$8 = "src/components/Modals/Finder/Finder.svelte";

    function create_fragment$9(ctx) {
    	let div5;
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let span;
    	let t2;
    	let div4;
    	let div2;
    	let t4;
    	let div3;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text("SideBar");
    			t1 = space();
    			span = element("span");
    			t2 = space();
    			div4 = element("div");
    			div2 = element("div");
    			div2.textContent = "Finder";
    			t4 = space();
    			div3 = element("div");
    			div3.textContent = "Finder";
    			attr_dev(div0, "class", "sideBar svelte-1q1th79");
    			set_style(div0, "--width", `${/*width*/ ctx[2]}px`);
    			add_location(div0, file$8, 34, 2, 1018);
    			attr_dev(span, "class", "widthSetter svelte-1q1th79");
    			add_location(span, file$8, 43, 2, 1112);
    			attr_dev(div1, "class", "sideBarWrapper svelte-1q1th79");
    			add_location(div1, file$8, 33, 1, 987);
    			attr_dev(div2, "class", "header svelte-1q1th79");
    			add_location(div2, file$8, 46, 2, 1209);
    			attr_dev(div3, "class", "body svelte-1q1th79");
    			add_location(div3, file$8, 47, 2, 1244);
    			attr_dev(div4, "class", "bodyWrapper svelte-1q1th79");
    			add_location(div4, file$8, 45, 1, 1181);
    			attr_dev(div5, "class", "container svelte-1q1th79");
    			add_location(div5, file$8, 32, 0, 938);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			append_dev(div1, span);
    			/*span_binding*/ ctx[3](span);
    			append_dev(div5, t2);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			/*div5_binding*/ ctx[4](div5);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*width*/ 4) {
    				set_style(div0, "--width", `${/*width*/ ctx[2]}px`);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			/*span_binding*/ ctx[3](null);
    			/*div5_binding*/ ctx[4](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Finder', slots, []);
    	let widthSetter, container;

    	let width = JSON.parse(localStorage.getItem("finder_sidebar_width")) || 200,
    		isClicked = false;

    	onMount(() => {
    		widthSetter.addEventListener("mousedown", onMouseDown);
    		window.addEventListener("mousemove", onMouseMove);
    		window.addEventListener("mouseup", onMouseUp);
    	});

    	const onMouseDown = () => {
    		isClicked = true;
    	};

    	const onMouseUp = () => {
    		isClicked = false;
    		localStorage.setItem("finder_sidebar_width", JSON.stringify(width));
    	};

    	const onMouseMove = e => {
    		if (isClicked) {
    			const containerLeft = container.getBoundingClientRect().left;
    			const sideBarWidth = e.pageX - containerLeft;

    			if (sideBarWidth <= 100) {
    				$$invalidate(2, width = 100);
    			} else if (sideBarWidth >= 450) {
    				$$invalidate(2, width = 450);
    			} else {
    				$$invalidate(2, width = sideBarWidth);
    			}
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Finder> was created with unknown prop '${key}'`);
    	});

    	function span_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			widthSetter = $$value;
    			$$invalidate(0, widthSetter);
    		});
    	}

    	function div5_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			container = $$value;
    			$$invalidate(1, container);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		widthSetter,
    		container,
    		width,
    		isClicked,
    		onMouseDown,
    		onMouseUp,
    		onMouseMove
    	});

    	$$self.$inject_state = $$props => {
    		if ('widthSetter' in $$props) $$invalidate(0, widthSetter = $$props.widthSetter);
    		if ('container' in $$props) $$invalidate(1, container = $$props.container);
    		if ('width' in $$props) $$invalidate(2, width = $$props.width);
    		if ('isClicked' in $$props) isClicked = $$props.isClicked;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [widthSetter, container, width, span_binding, div5_binding];
    }

    class Finder extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Finder",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    const bgUrl = "./images/backgrounds";
    const thumbUrl = "./images/thumbnails/backgrounds";
    const bgImgs = [
        {
            src: `${bgUrl}/background_redChroma.png`,
            thumb: `${thumbUrl}/thumb_redChroma.webp`,
            title: "RedChroma",
        },
        {
            src: `${bgUrl}/background_monterey.png`,
            thumb: `${thumbUrl}/thumb_monterey.webp`,
            title: "Monterey(Graphic)",
        },
        {
            src: `${bgUrl}/background_bigsur.png`,
            thumb: `${thumbUrl}/thumb_bigsur.webp`,
            title: "Bigsur(Graphic)",
        },
        {
            src: `${bgUrl}/background_mojave.png`,
            thumb: `${thumbUrl}/thumb_mojave.webp`,
            title: "Mojave",
        },
        {
            src: `${bgUrl}/background_catalina.png`,
            thumb: `${thumbUrl}/thumb_catalina.webp`,
            title: "Catalina",
        },
        {
            src: `${bgUrl}/background_sierra.png`,
            thumb: `${thumbUrl}/thumb_sierra.webp`,
            title: "Sierra",
        },
        {
            src: `${bgUrl}/background_yosemite.png`,
            thumb: `${thumbUrl}/thumb_yosemite.webp`,
            title: "Yosemite",
        },
        {
            src: `${bgUrl}/background_lion.png`,
            thumb: `${thumbUrl}/thumb_lion.webp`,
            title: "Lion",
        },
        {
            src: `${bgUrl}/background_leopard.png`,
            thumb: `${thumbUrl}/thumb_leopard.webp`,
            title: "Leopard",
        },
    ];

    /* src/components/Modals/Settings/BackgroundSetting/BackgroundSetting.svelte generated by Svelte v3.46.4 */
    const file$7 = "src/components/Modals/Settings/BackgroundSetting/BackgroundSetting.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (16:3) {#each bgImgs as img}
    function create_each_block$4(ctx) {
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let t1_value = /*img*/ ctx[3].title + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*img*/ ctx[3]);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(img, "class", "item__img svelte-1nepsxu");
    			if (!src_url_equal(img.src, img_src_value = /*img*/ ctx[3].thumb)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "bg");
    			toggle_class(img, "selected", /*$bgImg*/ ctx[0] === /*img*/ ctx[3].src);
    			add_location(img, file$7, 17, 5, 461);
    			attr_dev(div0, "class", "item__title svelte-1nepsxu");
    			add_location(div0, file$7, 23, 5, 586);
    			attr_dev(div1, "class", "item svelte-1nepsxu");
    			add_location(div1, file$7, 16, 4, 400);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, t1);
    			append_dev(div1, t2);

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$bgImg, bgImgs*/ 1) {
    				toggle_class(img, "selected", /*$bgImg*/ ctx[0] === /*img*/ ctx[3].src);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(16:3) {#each bgImgs as img}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div4;
    	let div1;
    	let div0;
    	let t1;
    	let div3;
    	let div2;
    	let each_value = bgImgs;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "배경 설정";
    			t1 = space();
    			div3 = element("div");
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "header__title svelte-1nepsxu");
    			add_location(div0, file$7, 10, 2, 274);
    			attr_dev(div1, "class", "header svelte-1nepsxu");
    			add_location(div1, file$7, 9, 1, 251);
    			attr_dev(div2, "class", "itemsWrapper svelte-1nepsxu");
    			add_location(div2, file$7, 14, 2, 344);
    			attr_dev(div3, "class", "body");
    			add_location(div3, file$7, 13, 1, 323);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$7, 8, 0, 226);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*handleSetImg, bgImgs, $bgImg*/ 3) {
    				each_value = bgImgs;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $bgImg;
    	validate_store(bgImg, 'bgImg');
    	component_subscribe($$self, bgImg, $$value => $$invalidate(0, $bgImg = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BackgroundSetting', slots, []);

    	const handleSetImg = bg => {
    		bgImg.set(bg.src);
    		localStorage.setItem("background", JSON.stringify(bg));
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BackgroundSetting> was created with unknown prop '${key}'`);
    	});

    	const click_handler = img => handleSetImg(img);
    	$$self.$capture_state = () => ({ bgImg, bgImgs, handleSetImg, $bgImg });
    	return [$bgImg, handleSetImg, click_handler];
    }

    class BackgroundSetting extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BackgroundSetting",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/components/Modals/Settings/Settings.svelte generated by Svelte v3.46.4 */
    const file$6 = "src/components/Modals/Settings/Settings.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let backgroundsetting;
    	let current;
    	backgroundsetting = new BackgroundSetting({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(backgroundsetting.$$.fragment);
    			attr_dev(div, "class", "container svelte-c44shy");
    			add_location(div, file$6, 3, 0, 82);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(backgroundsetting, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(backgroundsetting.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(backgroundsetting.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(backgroundsetting);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Settings', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Settings> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ BackgroundSetting });
    	return [];
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    const skillUrl = "./images/skills";
    const skillList = [
        {
            title: "html",
            src: `${skillUrl}/html.png`,
        },
        {
            title: "css",
            src: `${skillUrl}/css.png`,
        },
        {
            title: "javascript",
            src: `${skillUrl}/javascript.png`,
        },
        {
            title: "typescript",
            src: `${skillUrl}/typescript.png`,
        },
        {
            title: "react",
            src: `${skillUrl}/react.png`,
        },
        {
            title: "svelte",
            src: `${skillUrl}/svelte.png`,
        },
    ];

    /* src/components/Modals/Skill/Skill.svelte generated by Svelte v3.46.4 */
    const file$5 = "src/components/Modals/Skill/Skill.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (6:2) {#each skillList as skill}
    function create_each_block$3(ctx) {
    	let li;
    	let img;
    	let img_src_value;
    	let t0;
    	let div;
    	let t1_value = /*skill*/ ctx[0].title + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			li = element("li");
    			img = element("img");
    			t0 = space();
    			div = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			if (!src_url_equal(img.src, img_src_value = /*skill*/ ctx[0].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*skill*/ ctx[0].title);
    			attr_dev(img, "class", "svelte-llz05s");
    			add_location(img, file$5, 7, 4, 177);
    			attr_dev(div, "class", "svelte-llz05s");
    			add_location(div, file$5, 8, 4, 227);
    			attr_dev(li, "class", "skill svelte-llz05s");
    			add_location(li, file$5, 6, 3, 154);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, img);
    			append_dev(li, t0);
    			append_dev(li, div);
    			append_dev(div, t1);
    			append_dev(li, t2);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(6:2) {#each skillList as skill}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let ul;
    	let each_value = skillList;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "wrapper svelte-llz05s");
    			add_location(ul, file$5, 4, 1, 101);
    			attr_dev(div, "class", "container svelte-llz05s");
    			add_location(div, file$5, 3, 0, 76);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*skillList*/ 0) {
    				each_value = skillList;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Skill', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Skill> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ skillList });
    	return [];
    }

    class Skill extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Skill",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    const historyList = [
        {
            from: new Date(2015, 2),
            title: "학생회",
            content: "금오공과대학교 컴퓨터공학과 학생회 사무차장으로서 학생회 활동을 하였음.",
        },
        {
            from: new Date(2016, 2),
            title: "셈틀꾼 멘토",
            content: "컴퓨터공학과 학술동아리 '셈틀꾼'에서 16학년도 신입생을 대상으로 C언어 전공과목 멘토를 진행함.",
        },
        {
            from: new Date(2018, 8),
            title: "셈틀꾼 멘토",
            content: "군복학 후 학술동아리 '셈틀꾼'에서 18학년도 신입생을 대상으로 C언어 전공과목 멘토를 진행함.",
        },
        {
            from: new Date(2018, 10),
            title: "System Software Lab",
            content: "컴퓨터공학과 System Software Lab의 연구원으로 활동을 시작함.",
        },
        {
            from: new Date(2019, 2),
            title: "셈틀꾼 회장 & 멘토",
            content: "학술동아리 '셈틀꾼'의 회장직을 맡고 동아리 운영을 함과 동시에 19학년도 신입생을 대상으로 Python 전공과목 멘토를 진행함.",
        },
        {
            from: new Date(2019, 5),
            title: "KIT 전공탐색가이드 5기",
            content: "입학관리본부 소속으로 학교와 본인의 학과인 컴퓨터공학과를 알리는 'KIT 전공탐색가이드'활동을 시작함. 고교에 다니면서 학교와 학과에대한 이해를 시켜주는 등의 활동을 함.",
        },
        {
            from: new Date(2019, 7),
            title: "신입생 멘토",
            content: "19학년도 신입생을 대상으로 학교적응을 위한 멘토활동과, 다양한 교내활동을 안내 해주며 신입생들이 학교생활에 익숙해질 수 있도록 멘토링을 진행함.",
        },
        {
            from: new Date(2019, 8),
            title: "전공멘토(Linux)",
            content: "전공과목 'Linux 프로그래밍'의 멘토로 선정되어 2학년 학우들을 대상으로 해당 교과목의 이해를 돕기위한 조교 및 멘토링을 진행함.",
        },
        {
            from: new Date(2020, 1),
            title: "KIT 전공탐색가이드 6기",
            content: "입학관리본부 소속으로 학교와 본인의 학과인 컴퓨터공학과를 알리는 'KIT 전공탐색가이드'활동을 5기에 이어서 6기활동을 수행함.",
        },
        {
            from: new Date(2020, 2),
            title: "셈틀꾼 멘토",
            content: "컴퓨터공학과 학술동아리 '셈틀꾼'에서 20학년도 신입생을 대상으로 Python 전공과목 멘토를 진행함.",
        },
        {
            from: new Date(2020, 6),
            title: "셈틀꾼 웹프로그래밍 멘토",
            content: "컴퓨터공학과 학술동아리 '셈틀꾼'에서 동아리원을 대상으로 'html', 'css', 'javascript'등 Web FrontEnd 멘토링을 진행함.",
        },
        {
            from: new Date(2020, 11),
            title: "벙커키즈 입사",
            content: "스타트업 벙커키즈의 프론트엔드 개발자로 입사하여, Web, App 개발을 하고있음. 주 개발스택은 React, React-Native를 사용하고 있으며, 현재 메인 서비스로 운영중.",
        },
        {
            from: new Date(2021, 9),
            title: "마이리얼트립 입사",
            content: "마이리얼트립의 프론트엔드 개발자로 입사하여 활동중.",
        },
    ];

    /* src/components/Modals/History/History.svelte generated by Svelte v3.46.4 */
    const file$4 = "src/components/Modals/History/History.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (52:4) {#each years as year}
    function create_each_block_1(ctx) {
    	let li;
    	let t0_value = /*year*/ ctx[16] + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[6](/*year*/ ctx[16]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = text("년\n\t\t\t\t\t");
    			attr_dev(li, "class", "sideBar__list__item svelte-1ud8lvc");
    			toggle_class(li, "focus", /*selectedYear*/ ctx[3] === /*year*/ ctx[16]);
    			add_location(li, file$4, 52, 5, 1559);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*selectedYear, years*/ 24) {
    				toggle_class(li, "focus", /*selectedYear*/ ctx[3] === /*year*/ ctx[16]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(52:4) {#each years as year}",
    		ctx
    	});

    	return block;
    }

    // (71:5) {#if history.from.getFullYear() === selectedYear}
    function create_if_block$4(ctx) {
    	let li;
    	let div0;
    	let t0_value = /*history*/ ctx[13].title + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*history*/ ctx[13].content + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			li = element("li");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(div0, "class", "history__title svelte-1ud8lvc");
    			add_location(div0, file$4, 72, 7, 2052);
    			attr_dev(div1, "class", "history__content svelte-1ud8lvc");
    			add_location(div1, file$4, 73, 7, 2109);
    			attr_dev(li, "class", "history svelte-1ud8lvc");
    			add_location(li, file$4, 71, 6, 2024);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div0);
    			append_dev(div0, t0);
    			append_dev(li, t1);
    			append_dev(li, div1);
    			append_dev(div1, t2);
    			append_dev(li, t3);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(71:5) {#if history.from.getFullYear() === selectedYear}",
    		ctx
    	});

    	return block;
    }

    // (70:4) {#each historyList as history}
    function create_each_block$2(ctx) {
    	let show_if = /*history*/ ctx[13].from.getFullYear() === /*selectedYear*/ ctx[3];
    	let if_block_anchor;
    	let if_block = show_if && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedYear*/ 8) show_if = /*history*/ ctx[13].from.getFullYear() === /*selectedYear*/ ctx[3];

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(70:4) {#each historyList as history}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div6;
    	let div2;
    	let div1;
    	let div0;
    	let t1;
    	let ul0;
    	let t2;
    	let span;
    	let t3;
    	let div5;
    	let div3;
    	let t5;
    	let div4;
    	let ul1;
    	let each_value_1 = /*years*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = historyList;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "연도";
    			t1 = space();
    			ul0 = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			span = element("span");
    			t3 = space();
    			div5 = element("div");
    			div3 = element("div");
    			div3.textContent = "히스토리";
    			t5 = space();
    			div4 = element("div");
    			ul1 = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "sideBar__category svelte-1ud8lvc");
    			add_location(div0, file$4, 49, 3, 1458);
    			attr_dev(ul0, "class", "sideBar__list svelte-1ud8lvc");
    			add_location(ul0, file$4, 50, 3, 1501);
    			attr_dev(div1, "class", "sideBar svelte-1ud8lvc");
    			set_style(div1, "--width", `${/*width*/ ctx[2]}px`);
    			add_location(div1, file$4, 43, 2, 1384);
    			attr_dev(span, "class", "widthSetter svelte-1ud8lvc");
    			add_location(span, file$4, 63, 2, 1753);
    			attr_dev(div2, "class", "sideBarWrapper svelte-1ud8lvc");
    			add_location(div2, file$4, 42, 1, 1353);
    			attr_dev(div3, "class", "header svelte-1ud8lvc");
    			add_location(div3, file$4, 66, 2, 1850);
    			attr_dev(ul1, "class", "histories svelte-1ud8lvc");
    			add_location(ul1, file$4, 68, 3, 1905);
    			attr_dev(div4, "class", "body svelte-1ud8lvc");
    			add_location(div4, file$4, 67, 2, 1883);
    			attr_dev(div5, "class", "bodyWrapper svelte-1ud8lvc");
    			add_location(div5, file$4, 65, 1, 1822);
    			attr_dev(div6, "class", "container svelte-1ud8lvc");
    			add_location(div6, file$4, 41, 0, 1304);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t1);
    			append_dev(div1, ul0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul0, null);
    			}

    			append_dev(div2, t2);
    			append_dev(div2, span);
    			/*span_binding*/ ctx[7](span);
    			append_dev(div6, t3);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div5, t5);
    			append_dev(div5, div4);
    			append_dev(div4, ul1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul1, null);
    			}

    			/*div6_binding*/ ctx[8](div6);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selectedYear, years, handleClickYear*/ 56) {
    				each_value_1 = /*years*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*width*/ 4) {
    				set_style(div1, "--width", `${/*width*/ ctx[2]}px`);
    			}

    			if (dirty & /*historyList, selectedYear*/ 8) {
    				each_value = historyList;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_each(each_blocks_1, detaching);
    			/*span_binding*/ ctx[7](null);
    			destroy_each(each_blocks, detaching);
    			/*div6_binding*/ ctx[8](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('History', slots, []);
    	let widthSetter, container;

    	let width = JSON.parse(localStorage.getItem("history_sidebar_width")) || 200,
    		isClicked = false;

    	const years = historyList.filter((history, idx, originList) => idx === originList.findIndex(item => item.from.getFullYear() === history.from.getFullYear())).map(history => history.from.getFullYear());
    	let selectedYear = years[0];

    	onMount(() => {
    		widthSetter.addEventListener("mousedown", onMouseDown);
    		window.addEventListener("mousemove", onMouseMove);
    		window.addEventListener("mouseup", onMouseUp);
    	});

    	const onMouseDown = () => {
    		isClicked = true;
    	};

    	const onMouseUp = () => {
    		isClicked = false;
    		localStorage.setItem("history_sidebar_width", JSON.stringify(width));
    	};

    	const onMouseMove = e => {
    		if (isClicked) {
    			const containerLeft = container.getBoundingClientRect().left;
    			const sideBarWidth = e.pageX - containerLeft;

    			if (sideBarWidth <= 100) {
    				$$invalidate(2, width = 100);
    			} else if (sideBarWidth >= 450) {
    				$$invalidate(2, width = 450);
    			} else {
    				$$invalidate(2, width = sideBarWidth);
    			}
    		}
    	};

    	const handleClickYear = year => {
    		$$invalidate(3, selectedYear = year);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<History> was created with unknown prop '${key}'`);
    	});

    	const click_handler = year => handleClickYear(year);

    	function span_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			widthSetter = $$value;
    			$$invalidate(0, widthSetter);
    		});
    	}

    	function div6_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			container = $$value;
    			$$invalidate(1, container);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		historyList,
    		widthSetter,
    		container,
    		width,
    		isClicked,
    		years,
    		selectedYear,
    		onMouseDown,
    		onMouseUp,
    		onMouseMove,
    		handleClickYear
    	});

    	$$self.$inject_state = $$props => {
    		if ('widthSetter' in $$props) $$invalidate(0, widthSetter = $$props.widthSetter);
    		if ('container' in $$props) $$invalidate(1, container = $$props.container);
    		if ('width' in $$props) $$invalidate(2, width = $$props.width);
    		if ('isClicked' in $$props) isClicked = $$props.isClicked;
    		if ('selectedYear' in $$props) $$invalidate(3, selectedYear = $$props.selectedYear);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		widthSetter,
    		container,
    		width,
    		selectedYear,
    		years,
    		handleClickYear,
    		click_handler,
    		span_binding,
    		div6_binding
    	];
    }

    class History extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "History",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const iconUrl = "./images/icons";
    const itemIDs = {
        myInfo: "myInfo",
        award: "award",
        certificate: "certificate",
        skill: "skill",
        finder: "finder",
        settings: "settings",
        history: "history",
    };
    const itemList = [
        {
            id: itemIDs.myInfo,
            title: "내 정보",
            isOpen: false,
            icon: `${iconUrl}/myInfo.png`,
            component: Info,
            zIndex: 0,
            nowOpen: false,
        },
        {
            id: itemIDs.award,
            title: "수상경력",
            isOpen: false,
            icon: `${iconUrl}/award.png`,
            component: Award,
            zIndex: 0,
            width: 800,
            height: 500,
            nowOpen: false,
        },
        {
            id: itemIDs.certificate,
            title: "자격증",
            isOpen: false,
            icon: `${iconUrl}/certificate.png`,
            component: Certificate,
            zIndex: 0,
            width: 600,
            height: 400,
            nowOpen: false,
        },
        {
            id: itemIDs.skill,
            title: "기술스택",
            isOpen: false,
            icon: `${iconUrl}/skill.png`,
            component: Skill,
            zIndex: 0,
            width: 800,
            height: 500,
            nowOpen: false,
        },
        {
            id: itemIDs.history,
            title: "히스토리",
            isOpen: false,
            icon: `${iconUrl}/history.png`,
            component: History,
            zIndex: 0,
            isAbsoluteHeader: true,
            width: 800,
            height: 500,
            nowOpen: false,
        },
        {
            id: itemIDs.finder,
            title: "Finder",
            isOpen: false,
            icon: `${iconUrl}/finder.png`,
            component: Finder,
            zIndex: 0,
            isAbsoluteHeader: true,
            width: 800,
            height: 500,
            nowOpen: false,
        },
        {
            id: itemIDs.settings,
            title: "환경설정",
            isOpen: false,
            icon: `${iconUrl}/settings.png`,
            component: Settings,
            zIndex: 0,
            nowOpen: false,
        },
    ];

    /* src/components/Header/Header.svelte generated by Svelte v3.46.4 */
    const file$3 = "src/components/Header/Header.svelte";

    // (44:3) {#if isFocusedPopup}
    function create_if_block_1(ctx) {
    	let ul;
    	let li;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li = element("li");
    			li.textContent = "김태성에 관하여";
    			attr_dev(li, "class", "svelte-1001nrz");
    			add_location(li, file$3, 45, 5, 1122);
    			attr_dev(ul, "class", "popup menuList svelte-1001nrz");
    			add_location(ul, file$3, 44, 4, 1089);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", /*handleClickMyInfo*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(44:3) {#if isFocusedPopup}",
    		ctx
    	});

    	return block;
    }

    // (56:3) {#if isOpenedCalendar}
    function create_if_block$3(ctx) {
    	let div;
    	let calendar;
    	let current;
    	calendar = new Calendar({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(calendar.$$.fragment);
    			attr_dev(div, "class", "popup calendarWrapper svelte-1001nrz");
    			add_location(div, file$3, 56, 4, 1341);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(calendar, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(calendar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(calendar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(calendar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(56:3) {#if isOpenedCalendar}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div5;
    	let div2;
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let t1;
    	let div4;
    	let div3;
    	let time;
    	let t2;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*isFocusedPopup*/ ctx[0] && create_if_block_1(ctx);

    	time = new Time({
    			props: {
    				onOpenCalendar: /*handleOpenCalendar*/ ctx[5]
    			},
    			$$inline: true
    		});

    	let if_block1 = /*isOpenedCalendar*/ ctx[1] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div4 = element("div");
    			div3 = element("div");
    			create_component(time.$$.fragment);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			if (!src_url_equal(img.src, img_src_value = logoImg)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			attr_dev(img, "class", "svelte-1001nrz");
    			add_location(img, file$3, 40, 4, 1015);
    			attr_dev(div0, "class", "logoWrapper svelte-1001nrz");
    			attr_dev(div0, "tabindex", "0");
    			add_location(div0, file$3, 34, 3, 896);
    			attr_dev(div1, "class", "elementWrapper svelte-1001nrz");
    			add_location(div1, file$3, 33, 2, 864);
    			attr_dev(div2, "class", "left svelte-1001nrz");
    			add_location(div2, file$3, 32, 1, 843);
    			attr_dev(div3, "class", "elementWrapper svelte-1001nrz");
    			add_location(div3, file$3, 52, 2, 1231);
    			attr_dev(div4, "class", "right svelte-1001nrz");
    			add_location(div4, file$3, 51, 1, 1209);
    			attr_dev(div5, "class", "container svelte-1001nrz");
    			attr_dev(div5, "id", "header");
    			add_location(div5, file$3, 31, 0, 806);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div1, t0);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div5, t1);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			mount_component(time, div3, null);
    			append_dev(div3, t2);
    			if (if_block1) if_block1.m(div3, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "focus", /*handleFocusMenu*/ ctx[2], false, false, false),
    					listen_dev(div0, "blur", /*handleBlurMenu*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isFocusedPopup*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div1, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*isOpenedCalendar*/ ctx[1]) {
    				if (if_block1) {
    					if (dirty & /*isOpenedCalendar*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div3, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(time.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(time.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			if (if_block0) if_block0.d();
    			destroy_component(time);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const logoImg = "./images/icons/logo.png";

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let { itemList } = $$props;
    	let { onOpenModal } = $$props;
    	let { onUpperModal } = $$props;
    	let isFocusedPopup = false;
    	let isOpenedCalendar = false;

    	const handleFocusMenu = () => {
    		$$invalidate(0, isFocusedPopup = true);
    	};

    	const handleBlurMenu = () => {
    		setTimeout(
    			() => {
    				$$invalidate(0, isFocusedPopup = false);
    			},
    			100
    		);
    	};

    	const handleClickMyInfo = () => {
    		const item = itemList.find(item => item.id === itemIDs.myInfo);

    		if (!item.isOpen) {
    			onOpenModal(item.id, true);
    		} else {
    			onUpperModal(item.id);
    		}
    	};

    	const handleOpenCalendar = () => {
    		$$invalidate(1, isOpenedCalendar = !isOpenedCalendar);
    	};

    	const writable_props = ['itemList', 'onOpenModal', 'onUpperModal'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('itemList' in $$props) $$invalidate(6, itemList = $$props.itemList);
    		if ('onOpenModal' in $$props) $$invalidate(7, onOpenModal = $$props.onOpenModal);
    		if ('onUpperModal' in $$props) $$invalidate(8, onUpperModal = $$props.onUpperModal);
    	};

    	$$self.$capture_state = () => ({
    		Calendar,
    		Time,
    		itemIDs,
    		itemList,
    		onOpenModal,
    		onUpperModal,
    		logoImg,
    		isFocusedPopup,
    		isOpenedCalendar,
    		handleFocusMenu,
    		handleBlurMenu,
    		handleClickMyInfo,
    		handleOpenCalendar
    	});

    	$$self.$inject_state = $$props => {
    		if ('itemList' in $$props) $$invalidate(6, itemList = $$props.itemList);
    		if ('onOpenModal' in $$props) $$invalidate(7, onOpenModal = $$props.onOpenModal);
    		if ('onUpperModal' in $$props) $$invalidate(8, onUpperModal = $$props.onUpperModal);
    		if ('isFocusedPopup' in $$props) $$invalidate(0, isFocusedPopup = $$props.isFocusedPopup);
    		if ('isOpenedCalendar' in $$props) $$invalidate(1, isOpenedCalendar = $$props.isOpenedCalendar);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		isFocusedPopup,
    		isOpenedCalendar,
    		handleFocusMenu,
    		handleBlurMenu,
    		handleClickMyInfo,
    		handleOpenCalendar,
    		itemList,
    		onOpenModal,
    		onUpperModal
    	];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			itemList: 6,
    			onOpenModal: 7,
    			onUpperModal: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*itemList*/ ctx[6] === undefined && !('itemList' in props)) {
    			console.warn("<Header> was created without expected prop 'itemList'");
    		}

    		if (/*onOpenModal*/ ctx[7] === undefined && !('onOpenModal' in props)) {
    			console.warn("<Header> was created without expected prop 'onOpenModal'");
    		}

    		if (/*onUpperModal*/ ctx[8] === undefined && !('onUpperModal' in props)) {
    			console.warn("<Header> was created without expected prop 'onUpperModal'");
    		}
    	}

    	get itemList() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemList(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onOpenModal() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onOpenModal(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onUpperModal() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onUpperModal(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Dock/Dock.svelte generated by Svelte v3.46.4 */
    const file$2 = "src/components/Dock/Dock.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (41:4) {#if item.isOpen}
    function create_if_block$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "menu__item__dot svelte-1f1ln9b");
    			add_location(div, file$2, 41, 5, 1121);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(41:4) {#if item.isOpen}",
    		ctx
    	});

    	return block;
    }

    // (27:2) {#each itemList as item}
    function create_each_block$1(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*item*/ ctx[5].title + "";
    	let t0;
    	let t1;
    	let div1;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t2;
    	let t3;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[4](/*item*/ ctx[5], ...args);
    	}

    	let if_block = /*item*/ ctx[5].isOpen && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			img = element("img");
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			attr_dev(div0, "class", "menu__item__title svelte-1f1ln9b");
    			add_location(div0, file$2, 28, 4, 811);
    			if (!src_url_equal(img.src, img_src_value = /*item*/ ctx[5].icon)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*item*/ ctx[5].title);
    			attr_dev(img, "class", "svelte-1f1ln9b");
    			add_location(img, file$2, 37, 5, 1037);
    			attr_dev(div1, "class", "menu__item__icon bounce svelte-1f1ln9b");
    			set_style(div1, "--bgColor", /*item*/ ctx[5].icon ? 'transparent' : 'red');
    			add_location(div1, file$2, 30, 4, 866);
    			attr_dev(div2, "class", "menu__item svelte-1f1ln9b");
    			add_location(div2, file$2, 27, 3, 782);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div2, t2);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t3);

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*itemList*/ 1 && t0_value !== (t0_value = /*item*/ ctx[5].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*itemList*/ 1 && !src_url_equal(img.src, img_src_value = /*item*/ ctx[5].icon)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*itemList*/ 1 && img_alt_value !== (img_alt_value = /*item*/ ctx[5].title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*itemList*/ 1) {
    				set_style(div1, "--bgColor", /*item*/ ctx[5].icon ? 'transparent' : 'red');
    			}

    			if (/*item*/ ctx[5].isOpen) {
    				if (if_block) ; else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div2, t3);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(27:2) {#each itemList as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let each_value = /*itemList*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "menu svelte-1f1ln9b");
    			add_location(div0, file$2, 25, 1, 733);
    			attr_dev(div1, "class", "container svelte-1f1ln9b");
    			attr_dev(div1, "id", "dock");
    			add_location(div1, file$2, 24, 0, 698);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*itemList, onClickMenu*/ 3) {
    				each_value = /*itemList*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Dock', slots, []);
    	let { itemList } = $$props;
    	let { onOpenModal } = $$props;
    	let { onUpperModal } = $$props;

    	const onClickMenu = (e, item) => {
    		e.preventDefault();

    		if (!item.isOpen) {
    			e.currentTarget.classList.remove("bounce"); // reset animation
    			void e.currentTarget.offsetWidth; // trigger reflow
    			e.currentTarget.classList.add("bounce"); // start animation
    			onOpenModal(item.id);
    		} else {
    			onUpperModal(item.id);
    		}
    	};

    	onMount(() => {
    		const elements = document.getElementsByClassName("menu__item__icon");

    		for (let i = 0; i < elements.length; i++) {
    			elements[i].classList.remove("bounce");
    		}
    	});

    	const writable_props = ['itemList', 'onOpenModal', 'onUpperModal'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dock> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (item, e) => onClickMenu(e, item);

    	$$self.$$set = $$props => {
    		if ('itemList' in $$props) $$invalidate(0, itemList = $$props.itemList);
    		if ('onOpenModal' in $$props) $$invalidate(2, onOpenModal = $$props.onOpenModal);
    		if ('onUpperModal' in $$props) $$invalidate(3, onUpperModal = $$props.onUpperModal);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		itemList,
    		onOpenModal,
    		onUpperModal,
    		onClickMenu
    	});

    	$$self.$inject_state = $$props => {
    		if ('itemList' in $$props) $$invalidate(0, itemList = $$props.itemList);
    		if ('onOpenModal' in $$props) $$invalidate(2, onOpenModal = $$props.onOpenModal);
    		if ('onUpperModal' in $$props) $$invalidate(3, onUpperModal = $$props.onUpperModal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [itemList, onClickMenu, onOpenModal, onUpperModal, click_handler];
    }

    class Dock extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			itemList: 0,
    			onOpenModal: 2,
    			onUpperModal: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dock",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*itemList*/ ctx[0] === undefined && !('itemList' in props)) {
    			console.warn("<Dock> was created without expected prop 'itemList'");
    		}

    		if (/*onOpenModal*/ ctx[2] === undefined && !('onOpenModal' in props)) {
    			console.warn("<Dock> was created without expected prop 'onOpenModal'");
    		}

    		if (/*onUpperModal*/ ctx[3] === undefined && !('onUpperModal' in props)) {
    			console.warn("<Dock> was created without expected prop 'onUpperModal'");
    		}
    	}

    	get itemList() {
    		throw new Error("<Dock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemList(value) {
    		throw new Error("<Dock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onOpenModal() {
    		throw new Error("<Dock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onOpenModal(value) {
    		throw new Error("<Dock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onUpperModal() {
    		throw new Error("<Dock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onUpperModal(value) {
    		throw new Error("<Dock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/Home/Home.svelte generated by Svelte v3.46.4 */
    const file$1 = "src/pages/Home/Home.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (45:2) {#if item.isOpen}
    function create_if_block$1(ctx) {
    	let basemodal;
    	let current;

    	basemodal = new BaseModal({
    			props: {
    				item: /*item*/ ctx[6],
    				absoluteHeader: /*item*/ ctx[6]?.isAbsoluteHeader,
    				nowOpen: /*item*/ ctx[6].nowOpen,
    				onCloseModal: /*handleCloseModal*/ ctx[3],
    				onUpperModal: /*handleUpperModal*/ ctx[4],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(basemodal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(basemodal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const basemodal_changes = {};
    			if (dirty & /*itemList*/ 1) basemodal_changes.item = /*item*/ ctx[6];
    			if (dirty & /*itemList*/ 1) basemodal_changes.absoluteHeader = /*item*/ ctx[6]?.isAbsoluteHeader;
    			if (dirty & /*itemList*/ 1) basemodal_changes.nowOpen = /*item*/ ctx[6].nowOpen;

    			if (dirty & /*$$scope, itemList*/ 513) {
    				basemodal_changes.$$scope = { dirty, ctx };
    			}

    			basemodal.$set(basemodal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(basemodal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(basemodal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(basemodal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(45:2) {#if item.isOpen}",
    		ctx
    	});

    	return block;
    }

    // (46:3) <BaseModal     item="{item}"     absoluteHeader="{item?.isAbsoluteHeader}"     nowOpen="{item.nowOpen}"     onCloseModal="{handleCloseModal}"     onUpperModal="{handleUpperModal}"    >
    function create_default_slot(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*item*/ ctx[6].component;

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*item*/ ctx[6].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(46:3) <BaseModal     item=\\\"{item}\\\"     absoluteHeader=\\\"{item?.isAbsoluteHeader}\\\"     nowOpen=\\\"{item.nowOpen}\\\"     onCloseModal=\\\"{handleCloseModal}\\\"     onUpperModal=\\\"{handleUpperModal}\\\"    >",
    		ctx
    	});

    	return block;
    }

    // (44:1) {#each itemList as item}
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*item*/ ctx[6].isOpen && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*item*/ ctx[6].isOpen) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*itemList*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(44:1) {#each itemList as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let header;
    	let t0;
    	let img;
    	let img_src_value;
    	let t1;
    	let t2;
    	let dock;
    	let current;

    	header = new Header({
    			props: {
    				itemList: /*itemList*/ ctx[0],
    				onOpenModal: /*handleOpenModal*/ ctx[2],
    				onUpperModal: /*handleUpperModal*/ ctx[4]
    			},
    			$$inline: true
    		});

    	let each_value = /*itemList*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	dock = new Dock({
    			props: {
    				itemList: /*itemList*/ ctx[0],
    				onOpenModal: /*handleOpenModal*/ ctx[2],
    				onUpperModal: /*handleUpperModal*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t0 = space();
    			img = element("img");
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			create_component(dock.$$.fragment);
    			attr_dev(img, "class", "background-img svelte-lr84ah");
    			if (!src_url_equal(img.src, img_src_value = /*$bgImg*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "background");
    			add_location(img, file$1, 41, 1, 1272);
    			attr_dev(main, "class", "svelte-lr84ah");
    			add_location(main, file$1, 34, 0, 1156);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t0);
    			append_dev(main, img);
    			append_dev(main, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(main, null);
    			}

    			append_dev(main, t2);
    			mount_component(dock, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const header_changes = {};
    			if (dirty & /*itemList*/ 1) header_changes.itemList = /*itemList*/ ctx[0];
    			header.$set(header_changes);

    			if (!current || dirty & /*$bgImg*/ 2 && !src_url_equal(img.src, img_src_value = /*$bgImg*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*itemList, handleCloseModal, handleUpperModal*/ 25) {
    				each_value = /*itemList*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(main, t2);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			const dock_changes = {};
    			if (dirty & /*itemList*/ 1) dock_changes.itemList = /*itemList*/ ctx[0];
    			dock.$set(dock_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(dock.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(dock.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_each(each_blocks, detaching);
    			destroy_component(dock);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $bgImg;
    	validate_store(bgImg, 'bgImg');
    	component_subscribe($$self, bgImg, $$value => $$invalidate(1, $bgImg = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);

    	const handleOpenModal = (id, nowOpen = false) => {
    		const index = itemList.findIndex(item => item.id === id);
    		const zIndexs = itemList.map(item => item.zIndex);
    		$$invalidate(0, itemList[index].zIndex = Math.max(...zIndexs) + 1, itemList);
    		$$invalidate(0, itemList[index].isOpen = true, itemList);
    		$$invalidate(0, itemList[index].nowOpen = nowOpen, itemList);
    	};

    	const handleCloseModal = id => {
    		const index = itemList.findIndex(item => item.id === id);
    		$$invalidate(0, itemList[index].zIndex = 0, itemList);
    		$$invalidate(0, itemList[index].isOpen = false, itemList);
    	};

    	const handleUpperModal = id => {
    		const index = itemList.findIndex(item => item.id === id);
    		const zIndexs = itemList.map(item => item.zIndex);
    		const maxIndex = Math.max(...zIndexs);

    		if (itemList[index].zIndex < maxIndex) {
    			$$invalidate(0, itemList[index].zIndex = maxIndex + 1, itemList);
    		}
    	};

    	const init = () => {
    		const bg = JSON.parse(localStorage.getItem("background")) || null;

    		if (bg) {
    			bgImg.set(bg.src);
    		}
    	};

    	init();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		bgImg,
    		Header,
    		Dock,
    		BaseModal,
    		itemList,
    		handleOpenModal,
    		handleCloseModal,
    		handleUpperModal,
    		init,
    		$bgImg
    	});

    	return [itemList, $bgImg, handleOpenModal, handleCloseModal, handleUpperModal];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/pages/Error/Error.svelte generated by Svelte v3.46.4 */

    const { Error: Error_1$1 } = globals;
    const file = "src/pages/Error/Error.svelte";

    function create_fragment$1(ctx) {
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let t1;
    	let br;
    	let t2;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = text("이 페이지를 보시려면");
    			br = element("br");
    			t2 = text("화면을 조금 더 키워주세요.");
    			attr_dev(img, "class", "icon svelte-iapp60");
    			if (!src_url_equal(img.src, img_src_value = infoIcon)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "info");
    			add_location(img, file, 4, 1, 98);
    			add_location(br, file, 5, 31, 178);
    			attr_dev(div0, "class", "title svelte-iapp60");
    			add_location(div0, file, 5, 1, 148);
    			attr_dev(div1, "class", "container svelte-iapp60");
    			add_location(div1, file, 3, 0, 73);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, t1);
    			append_dev(div0, br);
    			append_dev(div0, t2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const infoIcon = "./images/icons/info.png";

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Error', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Error> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ infoIcon });
    	return [];
    }

    class Error$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Error",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.46.4 */

    const { Error: Error_1, window: window_1 } = globals;

    // (20:0) {:else}
    function create_else_block(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(20:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (18:0) {#if $isMobile}
    function create_if_block(ctx) {
    	let error;
    	let current;
    	error = new Error$1({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(error.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(error, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(error.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(error.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(error, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(18:0) {#if $isMobile}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[2]);
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$isMobile*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window_1, "resize", /*onwindowresize*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const stdWidth = 900;

    function instance($$self, $$props, $$invalidate) {
    	let $isMobile;
    	validate_store(isMobile, 'isMobile');
    	component_subscribe($$self, isMobile, $$value => $$invalidate(1, $isMobile = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let innerWidth = window.innerWidth;

    	const handleResizeWindow = () => {
    		if (innerWidth <= stdWidth) {
    			isMobile.set(true);
    		} else {
    			isMobile.set(false);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(0, innerWidth = window_1.innerWidth);
    	}

    	$$self.$capture_state = () => ({
    		isMobile,
    		Home,
    		Error: Error$1,
    		stdWidth,
    		innerWidth,
    		handleResizeWindow,
    		$isMobile
    	});

    	$$self.$inject_state = $$props => {
    		if ('innerWidth' in $$props) $$invalidate(0, innerWidth = $$props.innerWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*innerWidth*/ 1) {
    			// $: 구문으로 인해 innerWidth가 변경될때마다 handleResizeWindow함수가 실행
    			(handleResizeWindow());
    		}
    	};

    	return [innerWidth, $isMobile, onwindowresize];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {},
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map

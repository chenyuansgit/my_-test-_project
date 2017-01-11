var Zepto = function () {
    function H(a) {
        return null == a ? String(a) : A[B.call(a)] || "object"
    }

    function I(a) {
        return "function" == H(a)
    }

    function J(a) {
        return null != a && a == a.window
    }

    function K(a) {
        return null != a && a.nodeType == a.DOCUMENT_NODE
    }

    function L(a) {
        return "object" == H(a)
    }

    function M(a) {
        return L(a) && !J(a) && Object.getPrototypeOf(a) == Object.prototype
    }

    function N(a) {
        return a instanceof Array
    }

    function O(a) {
        return "number" == typeof a.length
    }

    function P(a) {
        return h.call(a, function (a) {
            return null != a
        })
    }

    function Q(a) {
        return a.length > 0 ? d.fn.concat.apply([], a) : a
    }

    function R(a) {
        return a.replace(/::/g, "/").replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2").replace(/([a-z\d])([A-Z])/g, "$1_$2").replace(/_/g, "-").toLowerCase()
    }

    function S(a) {
        return a in k ? k[a] : k[a] = new RegExp("(^|\\s)" + a + "(\\s|$)")
    }

    function T(a, b) {
        return "number" != typeof b || l[R(a)] ? b : b + "px"
    }

    function U(a) {
        var b, c;
        return j[a] || (b = i.createElement(a), i.body.appendChild(b), c = getComputedStyle(b, "").getPropertyValue("display"), b.parentNode.removeChild(b), "none" == c && (c = "block"), j[a] = c), j[a]
    }

    function V(a) {
        return "children"in a ? g.call(a.children) : d.map(a.childNodes, function (a) {
            return 1 == a.nodeType ? a : void 0
        })
    }

    function W(a, d, e) {
        for (c in d)e && (M(d[c]) || N(d[c])) ? (M(d[c]) && !M(a[c]) && (a[c] = {}), N(d[c]) && !N(a[c]) && (a[c] = []), W(a[c], d[c], e)) : d[c] !== b && (a[c] = d[c])
    }

    function X(a, b) {
        return null == b ? d(a) : d(a).filter(b)
    }

    function Y(a, b, c, d) {
        return I(b) ? b.call(a, c, d) : b
    }

    function Z(a, b, c) {
        null == c ? a.removeAttribute(b) : a.setAttribute(b, c)
    }

    function $(a, c) {
        var d = a.className, e = d && d.baseVal !== b;
        return c === b ? e ? d.baseVal : d : (e ? d.baseVal = c : a.className = c, void 0)
    }

    function _(a) {
        var b;
        try {
            return a ? "true" == a || ("false" == a ? !1 : "null" == a ? null : /^0/.test(a) || isNaN(b = Number(a)) ? /^[\[\{]/.test(a) ? d.parseJSON(a) : a : b) : a
        } catch (c) {
            return a
        }
    }

    function ab(a, b) {
        b(a);
        for (var c in a.childNodes)ab(a.childNodes[c], b)
    }

    var b, c, d, e, D, E, a = /MSIE/.test(navigator.userAgent), f = [], g = f.slice, h = f.filter, i = window.document, j = {}, k = {}, l = {
        "column-count": 1,
        columns: 1,
        "font-weight": 1,
        "line-height": 1,
        opacity: 1,
        "z-index": 1,
        zoom: 1
    }, m = /^\s*<(\w+|!)[^>]*>/, n = /^<(\w+)\s*\/?>(?:<\/\1>|)$/, o = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, p = /^(?:body|html)$/i, q = /([A-Z])/g, r = ["val", "css", "html", "text", "data", "width", "height", "offset"], s = ["after", "prepend", "before", "append"], t = i.createElement("table"), u = i.createElement("tr"), v = {
        tr: i.createElement("tbody"),
        tbody: t,
        thead: t,
        tfoot: t,
        td: u,
        th: u,
        "*": i.createElement("div")
    }, w = /complete|loaded|interactive/, z = /^[\w-]*$/, A = {}, B = A.toString, C = {}, F = i.createElement("div"), G = {
        tabindex: "tabIndex",
        readonly: "readOnly",
        "for": "htmlFor",
        "class": "className",
        maxlength: "maxLength",
        cellspacing: "cellSpacing",
        cellpadding: "cellPadding",
        rowspan: "rowSpan",
        colspan: "colSpan",
        usemap: "useMap",
        frameborder: "frameBorder",
        contenteditable: "contentEditable"
    };
    return C.matches = function (a, b) {
        if (!b || !a || 1 !== a.nodeType)return !1;
        var c = a.webkitMatchesSelector || a.mozMatchesSelector || a.oMatchesSelector || a.matchesSelector;
        if (c)return c.call(a, b);
        var d, e = a.parentNode, f = !e;
        return f && (e = F).appendChild(a), d = ~C.qsa(e, b).indexOf(a), f && F.removeChild(a), d
    }, D = function (a) {
        return a.replace(/-+(.)?/g, function (a, b) {
            return b ? b.toUpperCase() : ""
        })
    }, E = function (a) {
        return h.call(a, function (b, c) {
            return a.indexOf(b) == c
        })
    }, C.fragment = function (a, c, e) {
        var f, h, j;
        return n.test(a) && (f = d(i.createElement(RegExp.$1))), f || (a.replace && (a = a.replace(o, "<$1></$2>")), c === b && (c = m.test(a) && RegExp.$1), c in v || (c = "*"), j = v[c], j.innerHTML = "" + a, f = d.each(g.call(j.childNodes), function () {
            j.removeChild(this)
        })), M(e) && (h = d(f), d.each(e, function (a, b) {
            r.indexOf(a) > -1 ? h[a](b) : h.attr(a, b)
        })), f
    }, C.Z = function (a, b) {
        return a = a || [], a.__proto__ = d.fn, a.selector = b || "", a
    }, C.isZ = function (a) {
        return a instanceof C.Z
    }, C.init = function (a, c) {
        var e;
        if (!a)return C.Z();
        if ("string" == typeof a)if (a = a.trim(), "<" == a[0] && m.test(a))e = C.fragment(a, RegExp.$1, c), a = null; else {
            if (c !== b)return d(c).find(a);
            e = C.qsa(i, a)
        } else {
            if (I(a))return d(i).ready(a);
            if (C.isZ(a))return a;
            if (N(a))e = P(a); else if (L(a))e = [a], a = null; else if (m.test(a))e = C.fragment(a.trim(), RegExp.$1, c), a = null; else {
                if (c !== b)return d(c).find(a);
                e = C.qsa(i, a)
            }
        }
        return C.Z(e, a)
    }, d = function (a, b) {
        return C.init(a, b)
    }, d.extend = function (a) {
        var b, c = g.call(arguments, 1);
        return "boolean" == typeof a && (b = a, a = c.shift()), c.forEach(function (c) {
            W(a, c, b)
        }), a
    }, C.qsa = function (a, b) {
        var c, d = "#" == b[0], e = !d && "." == b[0], f = d || e ? b.slice(1) : b, h = z.test(f);
        return K(a) && h && d ? (c = a.getElementById(f)) ? [c] : [] : 1 !== a.nodeType && 9 !== a.nodeType ? [] : g.call(h && !d ? e ? a.getElementsByClassName(f) : a.getElementsByTagName(b) : a.querySelectorAll(b))
    }, d.contains = function (a, b) {
        return a !== b && a.contains(b)
    }, d.type = H, d.isFunction = I, d.isWindow = J, d.isArray = N, d.isPlainObject = M, d.isEmptyObject = function (a) {
        var b;
        for (b in a)return !1;
        return !0
    }, d.inArray = function (a, b, c) {
        return f.indexOf.call(b, a, c)
    }, d.camelCase = D, d.trim = function (a) {
        return null == a ? "" : String.prototype.trim.call(a)
    }, d.uuid = 0, d.support = {}, d.expr = {}, d.map = function (a, b) {
        var c, e, f, d = [];
        if (O(a))for (e = 0; e < a.length; e++)c = b(a[e], e), null != c && d.push(c); else for (f in a)c = b(a[f], f), null != c && d.push(c);
        return Q(d)
    }, d.each = function (a, b) {
        var c, d;
        if (O(a)) {
            for (c = 0; c < a.length; c++)if (b.call(a[c], c, a[c]) === !1)return a
        } else for (d in a)if (b.call(a[d], d, a[d]) === !1)return a;
        return a
    }, d.grep = function (a, b) {
        return h.call(a, b)
    }, window.JSON && (d.parseJSON = JSON.parse), d.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (a, b) {
        A["[object " + b + "]"] = b.toLowerCase()
    }), d.fn = {
        forEach: f.forEach,
        reduce: f.reduce,
        push: f.push,
        sort: f.sort,
        indexOf: f.indexOf,
        concat: f.concat,
        map: function (a) {
            return d(d.map(this, function (b, c) {
                return a.call(b, c, b)
            }))
        },
        slice: function () {
            return d(g.apply(this, arguments))
        },
        ready: function (a) {
            return w.test(i.readyState) && i.body ? a(d) : i.addEventListener("DOMContentLoaded", function () {
                a(d)
            }, !1), this
        },
        get: function (a) {
            return a === b ? g.call(this) : this[a >= 0 ? a : a + this.length]
        },
        toArray: function () {
            return this.get()
        },
        size: function () {
            return this.length
        },
        remove: function () {
            return this.each(function () {
                null != this.parentNode && this.parentNode.removeChild(this)
            })
        },
        each: function (a) {
            return f.every.call(this, function (b, c) {
                return a.call(b, c, b) !== !1
            }), this
        },
        filter: function (a) {
            return I(a) ? this.not(this.not(a)) : d(h.call(this, function (b) {
                return C.matches(b, a)
            }))
        },
        add: function (a, b) {
            return d(E(this.concat(d(a, b))))
        },
        is: function (a) {
            return this.length > 0 && C.matches(this[0], a)
        },
        not: function (a) {
            var c = [];
            if (I(a) && a.call !== b)this.each(function (b) {
                a.call(this, b) || c.push(this)
            }); else {
                var e = "string" == typeof a ? this.filter(a) : O(a) && I(a.item) ? g.call(a) : d(a);
                this.forEach(function (a) {
                    e.indexOf(a) < 0 && c.push(a)
                })
            }
            return d(c)
        },
        has: function (a) {
            return this.filter(function () {
                return L(a) ? d.contains(this, a) : d(this).find(a).size()
            })
        },
        eq: function (a) {
            return -1 === a ? this.slice(a) : this.slice(a, +a + 1)
        },
        first: function () {
            var a = this[0];
            return a && !L(a) ? a : d(a)
        },
        last: function () {
            var a = this[this.length - 1];
            return a && !L(a) ? a : d(a)
        },
        find: function (a) {
            var b, c = this;
            return b = "object" == typeof a ? d(a).filter(function () {
                var a = this;
                return f.some.call(c, function (b) {
                    return d.contains(b, a)
                })
            }) : 1 == this.length ? d(C.qsa(this[0], a)) : this.map(function () {
                return C.qsa(this, a)
            })
        },
        closest: function (a, b) {
            var c = this[0], e = !1;
            for ("object" == typeof a && (e = d(a)); c && !(e ? e.indexOf(c) >= 0 : C.matches(c, a));)c = c !== b && !K(c) && c.parentNode;
            return d(c)
        },
        parents: function (a) {
            for (var b = [], c = this; c.length > 0;)c = d.map(c, function (a) {
                return (a = a.parentNode) && !K(a) && b.indexOf(a) < 0 ? (b.push(a), a) : void 0
            });
            return X(b, a)
        },
        parent: function (a) {
            return X(E(this.pluck("parentNode")), a)
        },
        children: function (a) {
            return X(this.map(function () {
                return V(this)
            }), a)
        },
        contents: function () {
            return this.map(function () {
                return g.call(this.childNodes)
            })
        },
        siblings: function (a) {
            return X(this.map(function (a, b) {
                return h.call(V(b.parentNode), function (a) {
                    return a !== b
                })
            }), a)
        },
        empty: function () {
            return this.each(function () {
                this.innerHTML = ""
            })
        },
        pluck: function (a) {
            return d.map(this, function (b) {
                return b[a]
            })
        },
        show: function () {
            return this.each(function () {
                "none" == this.style.display && (this.style.display = ""), "none" == getComputedStyle(this, "").getPropertyValue("display") && (this.style.display = U(this.nodeName))
            })
        },
        replaceWith: function (a) {
            return this.before(a).remove()
        },
        wrap: function (a) {
            var b = I(a);
            if (this[0] && !b)var c = d(a).get(0), e = c.parentNode || this.length > 1;
            return this.each(function (f) {
                d(this).wrapAll(b ? a.call(this, f) : e ? c.cloneNode(!0) : c)
            })
        },
        wrapAll: function (a) {
            if (this[0]) {
                d(this[0]).before(a = d(a));
                for (var b; (b = a.children()).length;)a = b.first();
                d(a).append(this)
            }
            return this
        },
        wrapInner: function (a) {
            var b = I(a);
            return this.each(function (c) {
                var e = d(this), f = e.contents(), g = b ? a.call(this, c) : a;
                f.length ? f.wrapAll(g) : e.append(g)
            })
        },
        unwrap: function () {
            return this.parent().each(function () {
                d(this).replaceWith(d(this).children())
            }), this
        },
        clone: function () {
            return this.map(function () {
                return this.cloneNode(!0)
            })
        },
        hide: function () {
            return this.css("display", "none")
        },
        toggle: function (a) {
            return this.each(function () {
                var c = d(this);
                (a === b ? "none" == c.css("display") : a) ? c.show() : c.hide()
            })
        },
        prev: function (a) {
            return d(this.pluck("previousElementSibling")).filter(a || "*")
        },
        next: function (a) {
            return d(this.pluck("nextElementSibling")).filter(a || "*")
        },
        html: function (a) {
            return 0 === arguments.length ? this.length > 0 ? this[0].innerHTML : null : this.each(function (b) {
                var c = this.innerHTML;
                d(this).empty().append(Y(this, a, b, c))
            })
        },
        text: function (a) {
            return 0 === arguments.length ? this.length > 0 ? this[0].textContent : null : this.each(function () {
                this.textContent = a === b ? "" : "" + a
            })
        },
        attr: function (a, d) {
            var e;
            return "string" == typeof a && d === b ? 0 == this.length || 1 !== this[0].nodeType ? b : "value" == a && "INPUT" == this[0].nodeName ? this.val() : !(e = this[0].getAttribute(a)) && a in this[0] ? this[0][a] : e : this.each(function (b) {
                if (1 === this.nodeType)if (L(a))for (c in a)Z(this, c, a[c]); else Z(this, a, Y(this, d, b, this.getAttribute(a)))
            })
        },
        removeAttr: function (a) {
            return this.each(function () {
                1 === this.nodeType && Z(this, a)
            })
        },
        prop: function (a, c) {
            return a = G[a] || a, c === b ? this[0] && this[0][a] : this.each(function (b) {
                this[a] = Y(this, c, b, this[a])
            })
        },
        data: function (a, c) {
            var d = this.attr("data-" + a.replace(q, "-$1").toLowerCase(), c);
            return null !== d ? _(d) : b
        },
        val: function (a) {
            return 0 === arguments.length ? this[0] && (this[0].multiple ? d(this[0]).find("option").filter(function () {
                return this.selected
            }).pluck("value") : this[0].value) : this.each(function (b) {
                this.value = Y(this, a, b, this.value)
            })
        },
        offset: function (a) {
            if (a)return this.each(function (b) {
                var c = d(this), e = Y(this, a, b, c.offset()), f = c.offsetParent().offset(), g = {
                    top: e.top - f.top,
                    left: e.left - f.left
                };
                "static" == c.css("position") && (g.position = "relative"), c.css(g)
            });
            if (0 == this.length)return null;
            var b = this[0].getBoundingClientRect();
            return {
                left: b.left + window.pageXOffset,
                top: b.top + window.pageYOffset,
                width: Math.round(b.width),
                height: Math.round(b.height)
            }
        },
        css: function (b, e) {
            if (a)if ("string" == typeof b && 0 == b.indexOf("-webkit-"))b = "-ms-" + b.substring(8); else if ("object" == typeof b) {
                var f = {};
                for (var g in b)0 == g.indexOf("-webkit-") ? f["-ms-" + g.substring(8)] = b[g] : f[g] = b[g];
                b = f
            }
            if (arguments.length < 2) {
                var h = this[0], i = getComputedStyle(h, "");
                if (!h)return;
                if ("string" == typeof b)return h.style[D(b)] || i.getPropertyValue(b);
                if (N(b)) {
                    var j = {};
                    return d.each(N(b) ? b : [b], function (a, b) {
                        j[b] = h.style[D(b)] || i.getPropertyValue(b)
                    }), j
                }
            }
            var k = "";
            if ("string" == H(b))e || 0 === e ? k = R(b) + ":" + T(b, e) : this.each(function () {
                this.style.removeProperty(R(b))
            }); else for (c in b)b[c] || 0 === b[c] ? k += R(c) + ":" + T(c, b[c]) + ";" : this.each(function () {
                this.style.removeProperty(R(c))
            });
            return this.each(function () {
                this.style.cssText += ";" + k
            })
        },
        index: function (a) {
            return a ? this.indexOf(d(a)[0]) : this.parent().children().indexOf(this[0])
        },
        hasClass: function (a) {
            return a ? f.some.call(this, function (a) {
                return this.test($(a))
            }, S(a)) : !1
        },
        addClass: function (a) {
            return a ? this.each(function (b) {
                e = [];
                var c = $(this), f = Y(this, a, b, c);
                f.split(/\s+/g).forEach(function (a) {
                    d(this).hasClass(a) || e.push(a)
                }, this), e.length && $(this, c + (c ? " " : "") + e.join(" "))
            }) : this
        },
        removeClass: function (a) {
            return this.each(function (c) {
                return a === b ? $(this, "") : (e = $(this), Y(this, a, c, e).split(/\s+/g).forEach(function (a) {
                    e = e.replace(S(a), " ")
                }), $(this, e.trim()), void 0)
            })
        },
        toggleClass: function (a, c) {
            return a ? this.each(function (e) {
                var f = d(this), g = Y(this, a, e, $(this));
                g.split(/\s+/g).forEach(function (a) {
                    (c === b ? !f.hasClass(a) : c) ? f.addClass(a) : f.removeClass(a)
                })
            }) : this
        },
        scrollTop: function (a) {
            if (this.length) {
                var c = "scrollTop"in this[0];
                return a === b ? c ? this[0].scrollTop : this[0].pageYOffset : this.each(c ? function () {
                    this.scrollTop = a
                } : function () {
                    this.scrollTo(this.scrollX, a)
                })
            }
        },
        scrollLeft: function (a) {
            if (this.length) {
                var c = "scrollLeft"in this[0];
                return a === b ? c ? this[0].scrollLeft : this[0].pageXOffset : this.each(c ? function () {
                    this.scrollLeft = a
                } : function () {
                    this.scrollTo(a, this.scrollY)
                })
            }
        },
        position: function () {
            if (this.length) {
                var a = this[0], b = this.offsetParent(), c = this.offset(), e = p.test(b[0].nodeName) ? {
                    top: 0,
                    left: 0
                } : b.offset();
                return c.top -= parseFloat(d(a).css("margin-top")) || 0, c.left -= parseFloat(d(a).css("margin-left")) || 0, e.top += parseFloat(d(b[0]).css("border-top-width")) || 0, e.left += parseFloat(d(b[0]).css("border-left-width")) || 0, {
                    top: c.top - e.top,
                    left: c.left - e.left
                }
            }
        },
        offsetParent: function () {
            return this.map(function () {
                for (var a = this.offsetParent || i.body; a && !p.test(a.nodeName) && "static" == d(a).css("position");)a = a.offsetParent;
                return a
            })
        }
    }, d.fn.detach = d.fn.remove, ["width", "height"].forEach(function (a) {
        var c = a.replace(/./, function (a) {
            return a[0].toUpperCase()
        });
        d.fn[a] = function (e) {
            var f, g = this[0];
            return e === b ? J(g) ? g["inner" + c] : K(g) ? g.documentElement["scroll" + c] : (f = this.offset()) && f[a] : this.each(function (b) {
                g = d(this), g.css(a, Y(this, e, b, g[a]()))
            })
        }
    }), s.forEach(function (a, b) {
        var c = b % 2;
        d.fn[a] = function () {
            var a, f, e = d.map(arguments, function (b) {
                return a = H(b), "object" == a || "array" == a || null == b ? b : C.fragment(b)
            }), g = this.length > 1;
            return e.length < 1 ? this : this.each(function (a, h) {
                f = c ? h : h.parentNode, h = 0 == b ? h.nextSibling : 1 == b ? h.firstChild : 2 == b ? h : null, e.forEach(function (a) {
                    if (g)a = a.cloneNode(!0); else if (!f)return d(a).remove();
                    ab(f.insertBefore(a, h), function (a) {
                        null == a.nodeName || "SCRIPT" !== a.nodeName.toUpperCase() || a.type && "text/javascript" !== a.type || a.src || window.eval.call(window, a.innerHTML)
                    })
                })
            })
        }, d.fn[c ? a + "To" : "insert" + (b ? "Before" : "After")] = function (b) {
            return d(b)[a](this), this
        }
    }), C.Z.prototype = d.fn, C.uniq = E, C.deserializeValue = _, d.zepto = C, d
}();
window.Zepto = Zepto, void 0 === window.$ && (window.$ = Zepto), function (a) {
    function l(b, c, d) {
        var e = a.Event(c);
        return a(b).trigger(e, d), !e.isDefaultPrevented()
    }

    function m(a, b, d, e) {
        return a.global ? l(b || c, d, e) : void 0
    }

    function n(b) {
        b.global && 0 === a.active++ && m(b, null, "ajaxStart")
    }

    function o(b) {
        b.global && !--a.active && m(b, null, "ajaxStop")
    }

    function p(a, b) {
        var c = b.context;
        return b.beforeSend.call(c, a, b) === !1 || m(b, c, "ajaxBeforeSend", [a, b]) === !1 ? !1 : (m(b, c, "ajaxSend", [a, b]), void 0)
    }

    function q(a, b, c, d) {
        var e = c.context, f = "success";
        c.success.call(e, a, f, b), d && d.resolveWith(e, [a, f, b]), m(c, e, "ajaxSuccess", [b, c, a]), s(f, b, c)
    }

    function r(a, b, c, d, e) {
        var f = d.context;
        d.error.call(f, c, b, a), e && e.rejectWith(f, [c, b, a]), m(d, f, "ajaxError", [c, d, a || b]), s(b, c, d)
    }

    function s(a, b, c) {
        var d = c.context;
        c.complete.call(d, b, a), m(c, d, "ajaxComplete", [b, c]), o(c)
    }

    function t() {
    }

    function u(a) {
        return a && (a = a.split(";", 2)[0]), a && (a == j ? "html" : a == i ? "json" : g.test(a) ? "script" : h.test(a) && "xml") || "text"
    }

    function v(a, b) {
        return "" == b ? a : (a + "&" + b).replace(/[&?]{1,2}/, "?")
    }

    function w(b) {
        b.processData && b.data && "string" != a.type(b.data) && (b.data = a.param(b.data, b.traditional)), !b.data || b.type && "GET" != b.type.toUpperCase() || (b.url = v(b.url, b.data), b.data = void 0)
    }

    function x(b, c, d, e) {
        var f = !a.isFunction(c);
        return {
            url: b,
            charset: f && c && c.charset ? c.charset : void 0,
            data: f ? c : void 0,
            success: f ? a.isFunction(d) ? d : void 0 : c,
            dataType: f ? e || d : d
        }
    }

    function z(b, c, d, e) {
        var f, g = a.isArray(c), h = a.isPlainObject(c);
        a.each(c, function (c, i) {
            f = a.type(i), e && (c = d ? e : e + "[" + (h || "object" == f || "array" == f ? c : "") + "]"), !e && g ? b.add(i.name, i.value) : "array" == f || !d && "object" == f ? z(b, i, d, c) : b.add(c, i)
        })
    }

    var d, e, b = 0, c = window.document, f = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, g = /^(?:text|application)\/javascript/i, h = /^(?:text|application)\/xml/i, i = "application/json", j = "text/html", k = /^\s*$/;
    a.active = 0, a.ajaxJSONP = function (d, e) {
        if (!("type"in d))return a.ajax(d);
        var j, m, f = d.jsonpCallback, g = (a.isFunction(f) ? f() : f) || "jsonp" + ++b, h = c.createElement("script"), i = window[g], k = function (b) {
            a(h).triggerHandler("error", b || "abort")
        }, l = {abort: k};
        return e && e.promise(l), a(h).on("load error", function (b, c) {
            clearTimeout(m), a(h).off().remove(), "error" != b.type && j ? q(j[0], l, d, e) : r(null, c || "error", l, d, e), window[g] = i, j && a.isFunction(i) && i(j[0]), i = j = void 0
        }), p(l, d) === !1 ? (k("abort"), l) : (window[g] = window[g] || function () {
                j = arguments
            }, h.src = d.url.replace(/=\?/, "=" + g), c.head.appendChild(h), d.timeout > 0 && (m = setTimeout(function () {
            k("timeout")
        }, d.timeout)), l)
    }, a.ajaxSettings = {
        type: "GET",
        beforeSend: t,
        success: t,
        error: t,
        complete: t,
        context: null,
        global: !0,
        xhr: function () {
            return new window.XMLHttpRequest
        },
        accepts: {
            script: "text/javascript, application/javascript, application/x-javascript",
            json: i,
            xml: "application/xml, text/xml",
            html: j,
            text: "text/plain"
        },
        crossDomain: !1,
        timeout: 0,
        processData: !0,
        cache: !0
    }, a.ajax = function (b) {
        var c = a.extend({}, b || {}), f = a.Deferred && a.Deferred();
        for (d in a.ajaxSettings)void 0 === c[d] && (c[d] = a.ajaxSettings[d]);
        n(c), c.crossDomain || (c.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(c.url) && RegExp.$2 != window.location.host), c.url || (c.url = window.location.toString()), w(c), c.cache === !1 && (c.url = v(c.url, "_=" + Date.now()));
        var g = c.dataType, h = /=\?/.test(c.url);
        if ("jsonp" == g || h) {
            if (!h) {
                c.url = v(c.url, c.jsonp ? c.jsonp + "=?" : c.jsonp === !1 ? "" : c.url.indexOf("callback=") > -1 ? "" : null == c.success || c.success == t ? "" : "callback=?");
                var i = c.url.match(new RegExp((c.jsonp ? c.jsonp : "callback") + "=(\\w+)", "i"));
                null != i && i.length >= 2 && (c.jsonpCallback = i[1])
            }
            return a.ajaxJSONP(c, f)
        }
        var y, j = c.accepts[g], l = {}, m = function (a, b) {
            l[a.toLowerCase()] = [a, b]
        }, o = /^([\w-]+:)\/\//.test(c.url) ? RegExp.$1 : window.location.protocol, s = c.xhr(), x = s.setRequestHeader;
        if (f && f.promise(s), c.crossDomain || m("X-Requested-With", "XMLHttpRequest"), m("Accept", j || "*/*"), (j = c.mimeType || j) && (j.indexOf(",") > -1 && (j = j.split(",", 2)[0]), s.overrideMimeType && s.overrideMimeType(j)), (c.contentType || c.contentType !== !1 && c.data && "GET" != c.type.toUpperCase()) && m("Content-Type", c.contentType || "application/x-www-form-urlencoded"), c.headers)for (e in c.headers)m(e, c.headers[e]);
        if (s.setRequestHeader = m, s.onreadystatechange = function () {
                if (4 == s.readyState) {
                    s.onreadystatechange = t, clearTimeout(y);
                    var b, d = !1;
                    if (s.status >= 200 && s.status < 300 || 304 == s.status || 0 == s.status && "file:" == o) {
                        g = g || u(c.mimeType || s.getResponseHeader("content-type")), b = s.responseText;
                        try {
                            "script" == g ? (1, eval)(b) : "xml" == g ? b = s.responseXML : "json" == g && (b = k.test(b) ? null : a.parseJSON(b))
                        } catch (e) {
                            d = e
                        }
                        d ? r(d, "parsererror", s, c, f) : q(b, s, c, f)
                    } else r(s.statusText || null, s.status ? "error" : "abort", s, c, f)
                }
            }, p(s, c) === !1)return s.abort(), r(null, "abort", s, c, f), s;
        if (c.xhrFields)for (e in c.xhrFields)s[e] = c.xhrFields[e];
        var z = "async"in c ? c.async : !0;
        s.open(c.type, c.url, z, c.username, c.password);
        for (e in l)x.apply(s, l[e]);
        if (c.timeout > 0 && (y = setTimeout(function () {
                s.onreadystatechange = t, s.abort(), r(null, "timeout", s, c, f)
            }, c.timeout)), c.withCredentials)try {
            s.withCredentials = !0
        } catch (A) {
        }
        return s.send(c.data ? c.data : null), s
    }, a.get = function () {
        return a.ajax(x.apply(null, arguments))
    }, a.post = function () {
        var f = x.apply(null, arguments);
        return f.type = "POST", a.ajax(f)
    }, a.getJSON = function () {
        var e = x.apply(null, arguments);
        return e.dataType = "json", a.ajax(e)
    }, a.getScript = function (b, c, d) {
        return "string" == typeof c && null == d && (d = c, c = null), a.ajax({
            url: b,
            type: "GET",
            charset: d,
            data: void 0,
            success: c,
            dataType: "jsonp"
        })
    }, a.fn.load = function (b, c, d) {
        if (!this.length)return this;
        var h, e = this, g = b.split(/\s/), i = x(b, c, d), j = i.success;
        return g.length > 1 && (i.url = g[0], h = g[1]), i.success = function (b) {
            e.html(h ? a("<div>").html(b.replace(f, "")).find(h) : b), j && j.apply(e, arguments)
        }, a.ajax(i), this
    };
    var y = encodeURIComponent;
    a.param = function (a, b) {
        var c = [];
        return c.add = function (a, b) {
            this.push(y(a) + "=" + y(b))
        }, z(c, a, b), c.join("&").replace(/%20/g, "+")
    }
}(Zepto), function (a) {
    function m(a) {
        return a._zid || (a._zid = c++)
    }

    function n(a, b, c, d) {
        if (b = o(b), b.ns)var e = p(b.ns);
        return (h[m(a)] || []).filter(function (a) {
            return !(!a || b.e && a.e != b.e || b.ns && !e.test(a.ns) || c && m(a.fn) !== m(c) || d && a.sel != d)
        })
    }

    function o(a) {
        var b = ("" + a).split(".");
        return {e: b[0], ns: b.slice(1).sort().join(" ")}
    }

    function p(a) {
        return new RegExp("(?:^| )" + a.replace(" ", " .* ?") + "(?: |$)")
    }

    function q(a, b) {
        return a.del && !j && a.e in k || !!b
    }

    function r(a) {
        return l[a] || j && k[a] || a
    }

    function s(b, c, e, f, g, i, j) {
        var k = m(b), n = h[k] || (h[k] = []);
        c.split(/\s/).forEach(function (c) {
            if ("ready" == c)return a(document).ready(e);
            var h = o(c);
            h.fn = e, h.sel = g, h.e in l && (e = function (b) {
                var c = b.relatedTarget;
                return !c || c !== this && !a.contains(this, c) ? h.fn.apply(this, arguments) : void 0
            }), h.del = i;
            var k = i || e;
            h.proxy = function (a) {
                if (a = y(a), !a.isImmediatePropagationStopped()) {
                    a.data = f;
                    var c = k.apply(b, a._args == d ? [a] : [a].concat(a._args));
                    return c === !1 && (a.preventDefault(), a.stopPropagation()), c
                }
            }, h.i = n.length, n.push(h), "addEventListener"in b && b.addEventListener(r(h.e), h.proxy, q(h, j))
        })
    }

    function t(a, b, c, d, e) {
        var f = m(a);
        (b || "").split(/\s/).forEach(function (b) {
            n(a, b, c, d).forEach(function (b) {
                delete h[f][b.i], "removeEventListener"in a && a.removeEventListener(r(b.e), b.proxy, q(b, e))
            })
        })
    }

    function y(b, c) {
        return (c || !b.isDefaultPrevented) && (c || (c = b), a.each(x, function (a, d) {
            var e = c[a];
            b[a] = function () {
                return this[d] = u, e && e.apply(c, arguments)
            }, b[d] = v
        }), (c.defaultPrevented !== d ? c.defaultPrevented : "returnValue"in c ? c.returnValue === !1 : c.getPreventDefault && c.getPreventDefault()) && (b.isDefaultPrevented = u)), b
    }

    function z(a) {
        var b, c = {originalEvent: a};
        for (b in a)w.test(b) || a[b] === d || (c[b] = a[b]);
        return y(c, a)
    }

    var d, c = (a.zepto.qsa, 1), e = Array.prototype.slice, f = a.isFunction, g = function (a) {
        return "string" == typeof a
    }, h = {}, i = {}, j = "onfocusin"in window, k = {focus: "focusin", blur: "focusout"}, l = {
        mouseenter: "mouseover",
        mouseleave: "mouseout",
        touchstart: window.navigator.msPointerEnabled ? "MSPointerDown" : "touchstart",
        touchmove: window.navigator.msPointerEnabled ? "MSPointerMove" : "touchmove",
        touchend: window.navigator.msPointerEnabled ? "MSPointerCancel" : "touchend",
        touchcancel: window.navigator.msPointerEnabled ? "MSPointerCancel" : "touchcancel"
    };
    i.click = i.mousedown = i.mouseup = i.mousemove = "MouseEvents", a.event = {
        add: s,
        remove: t
    }, a.proxy = function (b, c) {
        if (f(b)) {
            var d = function () {
                return b.apply(c, arguments)
            };
            return d._zid = m(b), d
        }
        if (g(c))return a.proxy(b[c], b);
        throw new TypeError("expected function")
    }, a.fn.bind = function (a, b, c) {
        return this.on(a, b, c)
    }, a.fn.unbind = function (a, b) {
        return this.off(a, b)
    }, a.fn.one = function (a, b, c, d) {
        return this.on(a, b, c, d, 1)
    };
    var u = function () {
        return !0
    }, v = function () {
        return !1
    }, w = /^([A-Z]|returnValue$|layer[XY]$)/, x = {
        preventDefault: "isDefaultPrevented",
        stopImmediatePropagation: "isImmediatePropagationStopped",
        stopPropagation: "isPropagationStopped"
    };
    a.fn.delegate = function (a, b, c) {
        return this.on(b, a, c)
    }, a.fn.undelegate = function (a, b, c) {
        return this.off(b, a, c)
    }, a.fn.live = function (b, c) {
        return a(document.body).delegate(this.selector, b, c), this
    }, a.fn.die = function (b, c) {
        return a(document.body).undelegate(this.selector, b, c), this
    }, a.fn.on = function (b, c, h, i, j) {
        var k, l, m = this;
        return b && !g(b) ? (a.each(b, function (a, b) {
            m.on(a, c, h, b, j)
        }), m) : (g(c) || f(i) || i === !1 || (i = h, h = c, c = d), (f(h) || h === !1) && (i = h, h = d), i === !1 && (i = v), m.each(function (d, f) {
            j && (k = function (a) {
                return t(f, a.type, i), i.apply(this, arguments)
            }), c && (l = function (b) {
                var d, g = a(b.target).closest(c, f).get(0);
                return g && g !== f ? (d = a.extend(z(b), {
                    currentTarget: g,
                    liveFired: f
                }), (k || i).apply(g, [d].concat(e.call(arguments, 1)))) : void 0
            }), s(f, b, i, h, c, l || k)
        }))
    }, a.fn.off = function (b, c, e) {
        var h = this;
        return b && !g(b) ? (a.each(b, function (a, b) {
            h.off(a, c, b)
        }), h) : (g(c) || f(e) || e === !1 || (e = c, c = d), e === !1 && (e = v), h.each(function () {
            t(this, b, e, c)
        }))
    }, a.fn.trigger = function (b, c) {
        return b = g(b) || a.isPlainObject(b) ? a.Event(b) : y(b), b._args = c, this.each(function () {
            "dispatchEvent"in this ? this.dispatchEvent(b) : a(this).triggerHandler(b, c)
        })
    }, a.fn.triggerHandler = function (b, c) {
        var d, e;
        return this.each(function (f, h) {
            d = z(g(b) ? a.Event(b) : b), d._args = c, d.target = h, a.each(n(h, b.type || b), function (a, b) {
                return e = b.proxy(d), d.isImmediatePropagationStopped() ? !1 : void 0
            })
        }), e
    }, "focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select keydown keypress keyup error".split(" ").forEach(function (b) {
        a.fn[b] = function (a) {
            return a ? this.bind(b, a) : this.trigger(b)
        }
    }), ["focus", "blur"].forEach(function (b) {
        a.fn[b] = function (a) {
            return a ? this.bind(b, a) : this.each(function () {
                try {
                    this[b]()
                } catch (a) {
                }
            }), this
        }
    }), a.Event = function (a, b) {
        g(a) || (b = a, a = b.type);
        var c = document.createEvent(i[a] || "Events"), d = !0;
        if (b)for (var e in b)"bubbles" == e ? d = !!b[e] : c[e] = b[e];
        return c.initEvent(a, d, !0), y(c)
    }
}(Zepto), function (a) {
    "__proto__"in{} || a.extend(a.zepto, {
        Z: function (b, c) {
            return b = b || [], a.extend(b, a.fn), b.selector = c || "", b.__Z = !0, b
        }, isZ: function (b) {
            return "array" === a.type(b) && "__Z"in b
        }
    });
    try {
        getComputedStyle(void 0)
    } catch (b) {
        var c = getComputedStyle;
        window.getComputedStyle = function (a) {
            try {
                return c(a)
            } catch (b) {
                return null
            }
        }
    }
}(Zepto), function (a) {
    function i(a, b, c, d) {
        return Math.abs(a - b) >= Math.abs(c - d) ? a - b > 0 ? "Left" : "Right" : c - d > 0 ? "Up" : "Down"
    }

    function j() {
        f = null, b.last && (b.el.trigger("longTap"), b = {})
    }

    function k() {
        f && clearTimeout(f), f = null
    }

    function l() {
        c && clearTimeout(c), d && clearTimeout(d), e && clearTimeout(e), f && clearTimeout(f), c = d = e = f = null, b = {}
    }

    function m(a) {
        return ("touch" == a.pointerType || a.pointerType == a.MSPOINTER_TYPE_TOUCH) && a.isPrimary
    }

    function n(a, b) {
        return a.type == "pointer" + b || a.type.toLowerCase() == "mspointer" + b
    }

    var c, d, e, f, h, b = {}, g = 750;
    a(document).ready(function () {
        a.event = a.event || {};
        a.event.tap = typeof document.ontouchstart !== 'undefined'?'tap':'click';
        var o, p, s, t, q = 0, r = 0;
        "MSGesture"in window && (h = new MSGesture, h.target = document.body), a(document).bind("MSGestureEnd", function (a) {
            var c = a.velocityX > 1 ? "Right" : a.velocityX < -1 ? "Left" : a.velocityY > 1 ? "Down" : a.velocityY < -1 ? "Up" : null;
            c && (b.el.trigger("swipe"), b.el.trigger("swipe" + c))
        }).on("touchstart", function (d) {
            (!(t = n(d, "down")) || m(d)) && (s = t ? d : d.touches[0], d.touches && 1 === d.touches.length && b.x2 && (b.x2 = void 0, b.y2 = void 0), o = Date.now(), p = o - (b.last || o), b.el = a("tagName"in s.target ? s.target : s.target.parentNode), c && clearTimeout(c), b.x1 = s.pageX, b.y1 = s.pageY, p > 0 && 250 >= p && (b.isDoubleTap = !0), b.last = o, f = setTimeout(j, g), h && t && h.addPointer(d.pointerId))
        }).on("touchmove", function (a) {
            (!(t = n(a, "move")) || m(a)) && (s = t ? a : a.touches[0], k(), b.x2 = s.pageX, b.y2 = s.pageY, q += Math.abs(b.x1 - b.x2), r += Math.abs(b.y1 - b.y2))
        }), a(document).on(window.navigator.msPointerEnabled ? "MSPointerUp" : "touchend", function (f) {
            (!(t = n(f, "up")) || m(f)) && (k(), b.x2 && Math.abs(b.x1 - b.x2) > 30 || b.y2 && Math.abs(b.y1 - b.y2) > 30 ? e = setTimeout(function () {
                b.el.trigger("swipe"), b.el.trigger("swipe" + i(b.x1, b.x2, b.y1, b.y2)), b = {}
            }, 0) : "last"in b && (30 > q && 30 > r ? d = setTimeout(function () {
                var d = a.Event("tap");
                d.cancelTouch = l, b.el.trigger(d), b.isDoubleTap ? (b.el && b.el.trigger("doubleTap"), b = {}) : c = setTimeout(function () {
                    c = null, b.el && b.el.trigger("singleTap"), b = {}
                }, 250)
            }, 0) : b = {}), q = r = 0)
        }), a(document).on("touchcancel", l), a(window).on("scroll", l)
    }), ["swipe", "swipeLeft", "swipeRight", "swipeUp", "swipeDown", "doubleTap", "tap", "singleTap", "longTap"].forEach(function (b) {
        a.fn[b] = function (a) {
            return this.on(b, a)
        }
    })
}(Zepto);


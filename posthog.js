(function initPostHog() {
    const config = window.FONSECA_POSTHOG_CONFIG || {};
    const key = (config.key || window.FONSECA_POSTHOG_KEY || '').trim();
    // Prefer same-origin proxy so ad blockers don't kill capture.
    const apiHost = (config.api_host || '/relay-fsg').trim();
    const uiHost = (config.ui_host || 'https://us.posthog.com').trim();

    if (!key.startsWith('phc_')) {
        if (/localhost|127\.0\.0\.1/.test(window.location.hostname)) {
            console.info('[PostHog] No project key. Run npm run posthog:setup or set POSTHOG_KEY.');
        }
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const forceLocal = params.has('posthog') || params.get('posthog') === '1';
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    if (isLocal && !forceLocal) {
        console.info('[PostHog] Skipped on localhost. Add ?posthog=1 to enable local tracking.');
        return;
    }

    !function (t, e) {
        var o, n, p, r;
        e.__SV || (window.posthog = e, e._i = [], e.init = function (i, s, a) {
            function g(t, e) {
                var o = e.split('.');
                2 == o.length && (t = t[o[0]], e = o[1]);
                t[e] = function () {
                    t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
                };
            }
            (p = t.createElement('script')).type = 'text/javascript';
            p.crossOrigin = 'anonymous';
            p.async = !0;
            p.src = s.api_host.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js';
            (r = t.getElementsByTagName('script')[0]).parentNode.insertBefore(p, r);
            var u = e;
            for (void 0 !== a ? u = e[a] = [] : a = 'posthog', u.people = u.people || [], u.toString = function (t) {
                var e = 'posthog';
                return 'posthog' !== a && (e += '.' + a), t || (e += ' (stub)'), e;
            }, u.people.toString = function () {
                return u.toString(1) + '.people (stub)';
            }, o = 'init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug'.split(' '), n = 0; n < o.length; n++) g(u, o[n]);
            e._i.push([i, s, a]);
        }, e.__SV = 1);
    }(document, window.posthog || []);

    const lang = document.documentElement.lang || 'en';
    posthog.init(key, {
        api_host: apiHost,
        ui_host: uiHost,
        defaults: '2026-05-30',
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true,
    });

    posthog.register({
        site_language: lang.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en',
        site_version: 'fonseca-studio',
    });

    window.capturePosthog = function capturePosthog(event, properties) {
        if (!window.posthog?.capture) return;
        window.posthog.capture(event, properties || {});
    };
})();

package org.flexiblepower.runtime.ui.user;

import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.osgi.framework.Bundle;
import org.osgi.framework.BundleContext;
import org.osgi.service.http.HttpContext;
import org.osgi.service.useradmin.UserAdmin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import aQute.bnd.annotation.component.Activate;
import aQute.bnd.annotation.component.Component;
import aQute.bnd.annotation.component.ConfigurationPolicy;
import aQute.bnd.annotation.component.Reference;
import aQute.bnd.annotation.metatype.Meta;

@Component(provide = HttpContext.class,
properties = "contextId=fps",
designate = UserSessionHttpContext.Config.class,
configurationPolicy = ConfigurationPolicy.optional,
immediate = true)
public class UserSessionHttpContext implements HttpContext {
    private final static Logger logger = LoggerFactory.getLogger(UserSessionHttpContext.class);

    @Meta.OCD(name = "User session management configuration")
    public interface Config {
        @Meta.AD(deflt = "false", required = false)
        boolean isDisabled();
    }

    private final SessionManager sessionManager;

    public UserSessionHttpContext() {
        sessionManager = SessionManager.getInstance();
    }

    private Bundle bundle;

    private boolean disabled;

    private UserAdmin userAdmin;

    @Reference(dynamic = true, optional = true)
    public void setUserAdmin(UserAdmin userAdmin) {
        this.userAdmin = userAdmin;
    }

    public void unsetUserAdmin(UserAdmin userAdmin) {
        this.userAdmin = null;
    }

    @Activate
    public void activate(BundleContext context, Map<String, Object> parameters) {
        bundle = context.getBundle();

        disabled = false;
        if (parameters.containsKey("isDisabled")) {
            Object isDisabled = parameters.get("isDisabled");
            disabled = Boolean.parseBoolean(isDisabled.toString());
        }

        logger.debug("Started user context. Disabled = {}", disabled);
    }

    @Override
    public boolean handleSecurity(HttpServletRequest request, HttpServletResponse response) throws IOException {
        logger.trace("Entering handleSecurity, request.pathInfo = {}", request.getPathInfo());

        if (disabled || userAdmin == null) {
            return true;
        }

        try {
            Session session = sessionManager.getSession(request);
            request.setAttribute("session", session);
            request.setAttribute("user", session.getUser());
            logger.trace("Leaving handleSecurity, result = true");
            return true;
        } catch (IllegalSessionException e) {
            // Session not valid, redirect to /
            logger.warn("Unauthorized acces to " + request.getPathInfo()
                        + " (Cookies: "
                        + cookiesToString(request.getCookies())
                        + ")");
            response.sendRedirect("/login.html?from=" + request.getPathInfo());
            // response.sendError(HttpServletResponse.SC_UNAUTHORIZED,
            // "Please log in before you can access this page");
            logger.trace("Leaving handleSecurity, result = false");
            return false;
        }
    }

    private String cookiesToString(Cookie[] cookies) {
        if (cookies == null || cookies.length == 0) {
            return "";
        }

        List<String> strings = new ArrayList<String>(cookies.length);
        for (Cookie cookie : cookies) {
            strings.add(cookie.getName() + "=" + cookie.getValue());
        }

        return strings.toString();
    }

    @Override
    public URL getResource(String name) {
        if (name.startsWith("/")) {
            name = name.substring(1);
        }
        return bundle.getResource(name);
    }

    @Override
    public String getMimeType(String name) {
        return null;
    }
}

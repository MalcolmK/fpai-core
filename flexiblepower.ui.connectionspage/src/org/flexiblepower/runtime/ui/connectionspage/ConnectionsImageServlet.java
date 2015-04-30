package org.flexiblepower.runtime.ui.connectionspage;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.util.Collection;
import java.util.Enumeration;

import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.flexiblepower.ral.ResourceDriver;
import org.osgi.framework.Bundle;
import org.osgi.framework.BundleContext;
import org.osgi.framework.FrameworkUtil;
import org.osgi.framework.InvalidSyntaxException;
import org.osgi.framework.ServiceReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import aQute.bnd.annotation.component.Activate;
import aQute.bnd.annotation.component.Component;

@Component(provide = Servlet.class, properties = "alias=/connections", immediate = true)
public class ConnectionsImageServlet extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(ConnectionsImageServlet.class);
    private static final long serialVersionUID = 1107184413523344215L;

    public static URL findImage(Class<?> clazz) {
        Bundle bundle = FrameworkUtil.getBundle(clazz);
        Enumeration<URL> entries = bundle.findEntries("img", "appliance.png", true);
        if (entries.hasMoreElements()) {
            return entries.nextElement();
        } else {
            return null;
        }
    }

    private final URL defaultImage;

    public ConnectionsImageServlet() {
        defaultImage = findImage(getClass());
    }

    private BundleContext context;

    @Activate
    public void activate(BundleContext context) {
        this.context = context;
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        logger.info("Request: " + req);
        if (req.getPathInfo() != null && req.getPathInfo().endsWith(".png")) {
            try {
                Collection<ServiceReference<ResourceDriver>> references;
                String id = req.getPathInfo().substring(0, req.getPathInfo().length() - 4);
                references = context.getServiceReferences(ResourceDriver.class, "(applianceid=" + id + ")");
                if (!references.isEmpty()) {
                    ResourceDriver resourceDriver = context.getService(references.iterator().next());

                    URL image = findImage(resourceDriver.getClass());
                    if (image == null) {
                        image = defaultImage;
                    }

                    writeImage(image, resp);
                    return;
                }
            } catch (InvalidSyntaxException e) {
            }
        }

        resp.sendError(404);
    }

    private void writeImage(URL image, HttpServletResponse resp) throws IOException {
        resp.setContentType("image/png");
        InputStream is = image.openStream();
        OutputStream os = resp.getOutputStream();

        try {
            byte[] buffer = new byte[16 * 1024];
            int read = 0;
            while ((read = is.read(buffer)) >= 0) {
                os.write(buffer, 0, read);
            }
        } finally {
            os.close();
            is.close();
        }
    }
}

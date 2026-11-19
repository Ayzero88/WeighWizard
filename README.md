# WeighWiz

## Java backend and bundled runtime

The backend is compiled for Java 25. Build it from `server-java/weighwiz-backend`
with the Maven Wrapper:

```powershell
.\mvnw.cmd clean test
```

From the repository root, build the desktop application with:

```powershell
npm run dist
```

The desktop application packages the backend JAR together with the existing
Oracle Java Runtime 25.0.2 from the repository's `jre/` directory. Packaging
copies that runtime tree into the application resources without replacing or
modifying it. In development and in packaged builds, the Electron launcher
starts the backend using that bundled runtime rather than requiring a separately
installed Java runtime.

namespace V_Album_Server.Infrastructures;

public static class CommonUtils
{
    public static void EnsureDirectoryExists(string path)
    {
        string? dir = Path.GetDirectoryName(path);
        if (dir is null)
            return;

        Directory.CreateDirectory(dir);
    }
}
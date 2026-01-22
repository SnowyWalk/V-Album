namespace Server.Api.Common;

public static class ApiErrors
{
    public static IResult ToResult(this Exception ex)
    {
        return ex switch
        {
            UnauthorizedAccessException => Results.Unauthorized(),
            InvalidOperationException ioe => Results.BadRequest(new { message = ioe.Message }),
            _ => Results.Problem(ex.Message)
        };
    }
}

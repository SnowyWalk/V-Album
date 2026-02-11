using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddDbContext<V_Album_Server.Infrastructures.Persistence.Scaffold.AppDbContext>(opt => {
    var cs = builder.Configuration.GetConnectionString("Main");
    opt.UseMySql(cs, ServerVersion.AutoDetect(cs));
    });

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseAuthorization();
app.MapControllers();
app.Run();

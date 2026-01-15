using Microsoft.EntityFrameworkCore;
using Server.Data;
using System;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(opt =>
{
    var cs = builder.Configuration.GetConnectionString("AppDb");
    opt.UseSqlite(cs);

    // 개발 중 쿼리 확인용(원하면 끄면 됨)
    opt.EnableSensitiveDataLogging(builder.Environment.IsDevelopment());
    opt.EnableDetailedErrors(builder.Environment.IsDevelopment());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/", () => "OK");

app.Run();

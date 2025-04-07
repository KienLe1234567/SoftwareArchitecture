using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;

namespace Identity.Api;

public class IdentityDbContext(DbContextOptions<IdentityDbContext> options) : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>(options)
{
}

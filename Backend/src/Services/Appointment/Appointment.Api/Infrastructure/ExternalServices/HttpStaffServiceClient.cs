using System.Text.Json;
using Appointments.Api.Application.Interfaces;

namespace Appointments.Api.Infrastructure.ExternalServices;

public class HttpStaffServiceClient : IStaffServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public HttpStaffServiceClient(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<StaffDto?> GetStaffById(Guid id)
    {
        var response = await _httpClient.GetAsync($"{_configuration["Services:StaffApi"]}/api/staffs/{id}");

        if (!response.IsSuccessStatusCode)
        {
            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }
            throw new Exception($"Error getting staff: {response.StatusCode}");
        }

        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<StaffDto>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
    }
}
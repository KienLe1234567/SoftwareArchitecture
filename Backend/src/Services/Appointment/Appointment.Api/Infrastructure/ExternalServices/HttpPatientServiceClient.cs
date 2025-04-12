using System.Text.Json;
using Appointments.Api.Application.Interfaces;

namespace Appointments.Api.Infrastructure.ExternalServices;

public class HttpPatientServiceClient : IPatientServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public HttpPatientServiceClient(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<PatientDto?> GetPatientById(Guid id)
    {
        var response = await _httpClient.GetAsync($"{_configuration["Services:PatientApi"]}/api/patients/{id}");

        if (!response.IsSuccessStatusCode)
        {
            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }
            throw new Exception($"Error getting patient: {response.StatusCode}");
        }

        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<PatientDto>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
    }
}
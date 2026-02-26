using System.Threading;
using System.Threading.Tasks;
using V_Album_Server.Infrastructures.Persistence.Repositories;

namespace V_Album_Server.Services.User;

public class UserService
{
    private readonly UserRepository m_userRepository;
    public UserService(UserRepository userRepository)
    {
        m_userRepository = userRepository;
    }


    public async Task<Controllers.UserController.GetMeResponse> GetMe(string googleSub, CancellationToken ct)
    {
        Domains.User.User? me = await m_userRepository.GetUserByGoogleSub(googleSub, ct);
        if (me is null)
            throw new UserNotFoundException(googleSub);

        return new Controllers.UserController.GetMeResponse(me.UserUuid.ToString(), me.Nickname, me.Pic);
    }
}

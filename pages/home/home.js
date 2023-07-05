async function logOut()
{
    await logOff();
    goPage('/login');
}
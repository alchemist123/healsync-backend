const tokenGet = require('./lib/token.get');

module.exports = async (req, res) => {
  try {
    const { user } = req;
    let dashboardData = {
      name: `${user.first_name} ${user.middle_name} ${user.last_name}`,
      token: {},
      abha: {
        abha_address: user.abha_address,
        abha_number: user.abha_number,
        year_of_birth: user.year_of_birth,
        month_of_birth: user.month_of_birth,
        day_of_birth: user.day_of_birth,
        gender: user.gender,
      },
      last_priscription_date: '2024-01-15',
    };

    const token = await tokenGet(user.user_id);
    dashboardData.token = {
      token_number: token?.token_number || null,
      doctor_name: `${token?.User?.doctor?.first_name} ${token?.User?.doctor?.last_name}` || null,
      doctor_specialization: token?.User?.doctor?.specialization || null,
      current_token: '004',
      approx_waiting_time: '30 mins',
    };

    return res.status(200).json({
      message: 'Dashboard data fetched successfully',
      data: dashboardData,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

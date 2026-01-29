module.exports = async (req, res) => {
  try {
    const { user } = req;
    let dashboardData = {
      name: `${user.first_name} ${user.middle_name} ${user.last_name}`,
      token: {},
      abha: {
        abha_address: user.abha_address,
        abha_number: user.abha_number,
      },
      last_priscription_date: '2024-01-15',
    };

    const token = {
      token_number: '009',
      doctor_name: 'Anuroop',
      doctor_specialization: 'Cardiologist',
      current_token: '004',
      approx_waiting_time: '30 mins',
    };

    dashboardData.token = token;

    return res.status(200).json({
      message: 'Dashboard data fetched successfully',
      data: dashboardData,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

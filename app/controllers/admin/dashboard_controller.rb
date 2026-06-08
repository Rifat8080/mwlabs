module Admin
  class DashboardController < BaseController
    def show
      @users_count = User.count
    end
  end
end

module Admin
  class AgencySearchController < BaseController
    before_action :require_admin!

    def index
      @query = params[:q].to_s.strip
      if @query.present?
        @tasks = AgencyTask.where("title ILIKE ? OR description ILIKE ?", "%#{@query}%", "%#{@query}%").ordered.limit(20)
        @marketing_items = MarketingItem.where("title ILIKE ? OR description ILIKE ? OR topic ILIKE ?", "%#{@query}%", "%#{@query}%", "%#{@query}%").ordered.limit(20)
      else
        @tasks = AgencyTask.none
        @marketing_items = MarketingItem.none
      end
    end

    private

    def require_admin!
      return if admin_user?

      redirect_to dashboard_root_path, alert: "You do not have access to that area."
    end
  end
end

module Admin
  class NotificationsController < Admin::BaseController
    def index
      @notifications = current_user.notifications.recent.limit(50)
      authorize! :read, current_user.notifications.build
    end

    def open
      @notification = current_user.notifications.find(params[:id])
      authorize! :manage, @notification
      @notification.mark_as_read!
      broadcast_unread_count

      redirect_to notification_destination(@notification.url), allow_other_host: false
    end

    def update
      @notification = current_user.notifications.find(params[:id])
      authorize! :manage, @notification
      @notification.mark_as_read!
      broadcast_unread_count

      return_to = params[:return_to]

      respond_to do |format|
        format.html do
          redirect_to notification_destination(return_to || @notification.url), notice: "Notification marked as read"
        end
        format.turbo_stream do
          flash.now[:notice] = "Notification marked as read"
          render turbo_stream: notification_streams
        end
        format.json { head :no_content }
      end
    end

    def mark_all
      authorize! :manage, current_user.notifications.build
      current_user.notifications.unread.find_each(&:mark_as_read!)
      broadcast_unread_count

      respond_to do |format|
        format.html { redirect_to admin_notifications_path, notice: "All notifications marked as read" }
        format.turbo_stream do
          flash.now[:notice] = "All notifications marked as read"
          render turbo_stream: notification_streams
        end
      end
    end

    private

    def notification_streams
      @notifications = current_user.notifications.recent.limit(50)
      [
        turbo_stream.update("flash", partial: "shared/flash"),
        turbo_stream.replace("notifications-menu", partial: "shared/notifications_dropdown"),
        turbo_stream.update("admin-notifications-list", partial: "admin/notifications/list", locals: { notifications: @notifications })
      ]
    end

    def broadcast_unread_count
      Admin::NotificationsChannel.broadcast_to(
        current_user,
        type: "unread_count_changed",
        unread_count: current_user.notifications.unread.count
      )
    end

    def notification_destination(path)
      normalized = normalize_return_path(path)
      safe_admin_return_path?(normalized) ? normalized : admin_notifications_path
    end

    def safe_admin_return_path?(path)
      normalized = normalize_return_path(path)
      normalized.present? && normalized.start_with?("/admin")
    end

    def normalize_return_path(path)
      return if path.blank?
      return path if path.start_with?("/")

      uri = URI.parse(path.to_s)
      return uri.path if uri.path.present? && (uri.host.blank? || uri.host == request.host)

      nil
    rescue URI::InvalidURIError
      nil
    end
  end
end

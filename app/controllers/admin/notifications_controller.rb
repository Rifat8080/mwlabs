module Admin
  class NotificationsController < Admin::BaseController
    def index
      @notifications = current_user.notifications.recent.limit(50)
    end

    def update
      @notification = current_user.notifications.find(params[:id])
      @notification.mark_as_read!
      broadcast_unread_count

      return_to = params[:return_to]

      respond_to do |format|
        format.html do
          if safe_admin_return_path?(return_to)
            redirect_to return_to, notice: "Notification marked as read"
          else
            redirect_back fallback_location: admin_notifications_path, notice: "Notification marked as read"
          end
        end
        format.turbo_stream do
          if safe_admin_return_path?(return_to)
            redirect_to return_to, notice: "Notification marked as read"
          else
            flash.now[:notice] = "Notification marked as read"
            render turbo_stream: notification_streams
          end
        end
        format.json { head :no_content }
      end
    end

    def mark_all
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

    def safe_admin_return_path?(path)
      return false if path.blank?

      safe_path = url_from(path)
      safe_path.present? && safe_path.start_with?("/admin")
    end
  end
end

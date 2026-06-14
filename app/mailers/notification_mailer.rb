class NotificationMailer < ApplicationMailer
  def notify
    @action = params[:action]
    @notifiable = params[:notifiable]
    @actor = params[:actor]
    @details = params[:details]

    if params[:user]
      mail(to: params[:user].email, subject: "New notification: #{@action}")
    elsif params[:client]
      mail(to: params[:client].email, subject: "Update: #{@action}")
    else
      # no recipient
      nil
    end
  end
end

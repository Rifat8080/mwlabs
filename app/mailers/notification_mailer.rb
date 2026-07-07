class NotificationMailer < ApplicationMailer
  def notify
    @user = params[:user]
    @client = params[:client]
    @action = params[:action]
    @notifiable = params[:notifiable]
    @actor = params[:actor]
    @details = params[:details]

    if @user
      mail(to: @user.email, subject: "New notification: #{@action}")
    elsif @client
      mail(to: @client.email, subject: "Update: #{@action}")
    else
      # no recipient
      nil
    end
  end
end

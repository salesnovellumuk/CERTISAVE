from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.LoginView.as_view()),
    path('company/', views.CompanyView.as_view()),
    path('employees/', views.EmployeeListView.as_view()),
    path('employees/<int:pk>/', views.EmployeeDetailView.as_view()),
    path('certs/', views.CertListView.as_view()),
    path('certs/<int:pk>/', views.CertDetailView.as_view()),
    path('cert-types/', views.CertTypeListView.as_view()),
    path('booked-courses/', views.BookedCourseListView.as_view()),
    path('me/', views.MeView.as_view()),
    path('booked-courses/<int:pk>/', views.BookedCourseDetailView.as_view()),
    path('notifications/', views.NotificationListView.as_view()),
    path('notifications/<int:pk>/read/', views.NotificationMarkReadView.as_view()),
    path('change-requests/', views.ChangeRequestCreateView.as_view()),
    path('register/', views.RegisterView.as_view()),
    path('payments/setup-complete/', views.SetupCompleteView.as_view()),
    path('payments/cancel/', views.CancelSubscriptionView.as_view()),
    path('payments/webhook/', views.StripeWebhookView.as_view()),
    path('payments/upgrade/', views.UpgradePlanView.as_view()),
    path('payments/resubscribe/', views.ResubscribeView.as_view()),
    path('logout/', views.LogoutView.as_view()),
]
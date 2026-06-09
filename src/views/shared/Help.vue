<template>
  <div
    class="help-page"
    :dir="pageDirection"
    :class="isRTL ? 'text-right' : 'text-left'"
  >
    <b-row>
      <b-col cols="12">
        <b-card class="mb-2">
          <div class="d-flex align-items-center justify-content-between flex-wrap">
            <div>
              <!-- <h4 class="mb-50">{{ pageTitle }}</h4> -->
              <p class="text-muted mb-0">{{ pageIntro }}</p>
            </div>
            <b-badge variant="light-primary" class="mt-1 mt-md-0">
              {{ roleLabel }}
            </b-badge>
          </div>
        </b-card>
      </b-col>
    </b-row>

    <b-row>
      <b-col
        v-for="section in sections"
        :key="section.title"
        cols="12"
        md="6"
        xl="4"
        class="mb-2"
      >
        <b-card no-body class="h-100">
          <b-card-body>
            <div class="d-flex align-items-center mb-1">
              <feather-icon
                :icon="section.icon"
                size="20"
                class="text-primary"
                :class="isRTL ? 'ml-75' : 'mr-75'"
              />
              <h5 class="mb-0">{{ section.title }}</h5>
            </div>
            <ol
              class="help-steps mb-0"
              :class="isRTL ? 'pr-1' : 'pl-1'"
            >
              <li
                v-for="(step, index) in section.steps"
                :key="step"
                class="help-step-item mb-50"
              >
                <!-- <span class="help-step-number">{{ index + 1 }}.</span> -->
                <span class="help-step-text">{{ step }}</span>
              </li>
            </ol>
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>

    <b-card>
      <h5 class="mb-1">{{ content.quickTips }}</h5>
      <b-alert
        v-for="tip in tips"
        :key="tip"
        variant="light-info"
        show
        class="mb-1"
      >
        {{ tip }}
      </b-alert>
    </b-card>
  </div>
</template>

<script>
import {
  BAlert,
  BBadge,
  BCard,
  BCardBody,
  BCol,
  BRow,
} from 'bootstrap-vue'

const helpContent = {
  ar: {
    quickTips: 'نصائح سريعة',
    roles: {
      doctor: 'الدكتور',
      assistant: 'المساعدة',
      'sub-doctor': 'الدكتور المساعد',
    },
    titlePrefix: 'مساعدة',
    intros: {
      doctor: 'دليل سريع لإدارة العيادة، الحجوزات، الفريق، والتقارير.',
      assistant: 'دليل سريع للمهام اليومية الخاصة بالمساعدة داخل العيادة.',
      'sub-doctor': 'دليل سريع لإدارة حجوزاتك وخدماتك كدكتور مساعد.',
    },
    sharedTips: [
      'لو ظهرت رسالة خطأ في الحفظ، راجع الحقول المطلوبة مثل التاريخ، المبلغ، وطريقة الدفع.',
      'استخدم البحث والفلاتر لتقليل القائمة بدل التنقل بين صفحات كثيرة.',
      'أي تغيير مهم في الحجز يظهر داخل سجل الحركات في تفاصيل الحجز.',
    ],
    doctorTips: [
      'الحجز المستقبلي من تفاصيل الحجز يستخدم نفس العميل والطبيب تلقائياً.',
      'إكمال الحجز هو المكان المناسب لتسجيل التشخيص والعلاج والملفات.',
    ],
    assistantTips: [
      'تأكيد الحجز وتسجيل الوصول يساعد الدكتور على متابعة الدور بدقة.',
      'عند إضافة خدمة على الحجز، تأكد هل تحتاج فاتورة أم لا قبل الحفظ.',
    ],
    sections: {
      doctor: [
        {
          icon: 'UsersIcon',
          title: 'إدارة العملاء',
          steps: [
            'افتح العملاء من القائمة الجانبية.',
            'أضف عميل جديد أو افتح ملف عميل موجود.',
            'راجع رقم الهاتف والواتساب لأن رسائل التذكير تعتمد عليهما.',
          ],
        },
        {
          icon: 'ClipboardIcon',
          title: 'الحجوزات',
          steps: [
            'افتح حجوزاتي لمتابعة حجوزات اليوم.',
            'من تفاصيل الحجز يمكنك إنشاء حجز مستقبلي لنفس العميل.',
            'استخدم إكمال الحجز لتسجيل التشخيص والعلاج والطلبات الإضافية.',
          ],
        },
        {
          icon: 'ClockIcon',
          title: 'المواعيد والجدول',
          steps: [
            'افتح الجدول لتحديد أيام وساعات العمل.',
            'أضف الإجازات أو الأيام المتكررة غير المتاحة.',
            'النظام يمنع الحجز خارج أوقات العمل أو في وقت محجوز.',
          ],
        },
        {
          icon: 'UserPlusIcon',
          title: 'الفريق',
          steps: [
            'أضف المساعدين من صفحة المساعدين.',
            'أضف الدكتور المساعد من صفحة الدكاترة المساعدين حسب حدود الباقة.',
            'راجع الصلاحيات من الإدارة إذا لم تظهر صفحة معينة لأحد أفراد الفريق.',
          ],
        },
        {
          icon: 'DollarSignIcon',
          title: 'الماليات والمشتريات',
          steps: [
            'تابع الفواتير والمدفوعات من الماليات.',
            'سجل المصروفات من صفحة المشتريات.',
            'استخدم التقارير لمراجعة ملخص الدخل والحجوزات.',
          ],
        },
      ],
      assistant: [
        {
          icon: 'UsersIcon',
          title: 'العملاء',
          steps: [
            'افتح العملاء لإضافة عميل جديد أو تعديل بيانات عميل.',
            'تأكد من رقم الهاتف والواتساب قبل إنشاء الحجز.',
            'استخدم البحث للوصول السريع للعميل.',
          ],
        },
        {
          icon: 'CalendarIcon',
          title: 'إنشاء الحجز',
          steps: [
            'افتح الحجوزات ثم اختر حجز موعد جديد.',
            'اختر العميل والطبيب والتاريخ والوقت المتاح.',
            'أدخل المبلغ والمدفوع وطريقة الدفع ثم احفظ الحجز.',
          ],
        },
        {
          icon: 'ListIcon',
          title: 'قائمة الانتظار',
          steps: [
            'استخدم تسجيل الوصول عند حضور العميل.',
            'يمكنك ترتيب قائمة الانتظار حسب أولوية الدخول.',
            'استخدم إلغاء تسجيل الوصول إذا تم تسجيل العميل بالخطأ.',
          ],
        },
        {
          icon: 'DollarSignIcon',
          title: 'الماليات',
          steps: [
            'راجع الفواتير والمدفوعات من صفحة الماليات.',
            'سجل دفعات إضافية من صفحة المعاملات.',
            'تأكد من طريقة الدفع قبل حفظ أي مبلغ.',
          ],
        },
      ],
      'sub-doctor': [
        {
          icon: 'ClipboardIcon',
          title: 'حجوزاتي',
          steps: [
            'افتح حجوزاتي لمتابعة العملاء المسندين لك.',
            'افتح تفاصيل الحجز لمراجعة بيانات العميل وسجل الحركات.',
            'يمكنك إنشاء حجز مستقبلي لنفس العميل من تفاصيل الحجز.',
          ],
        },
        {
          icon: 'CheckCircleIcon',
          title: 'إكمال الحجز',
          steps: [
            'استخدم زر إكمال الحجز عند انتهاء الكشف.',
            'سجل التشخيص والعلاج والإجراءات الحالية والقادمة.',
            'أرفق الملفات المطلوبة إذا كانت متاحة.',
          ],
        },
        {
          icon: 'GridIcon',
          title: 'الخدمات',
          steps: [
            'راجع الخدمات المتاحة من صفحة الخدمات.',
            'أضف خدمة إضافية للحجز عند الحاجة.',
            'حدد هل الخدمة بفاتورة أو بدون فاتورة قبل الحفظ.',
          ],
        },
      ],
    },
  },
  en: {
    quickTips: 'Quick Tips',
    roles: {
      doctor: 'Doctor',
      assistant: 'Assistant',
      'sub-doctor': 'Sub Doctor',
    },
    titlePrefix: 'Help for',
    intros: {
      doctor: 'A quick guide for managing the clinic, reservations, team, and reports.',
      assistant: 'A quick guide for the assistant daily tasks inside the clinic.',
      'sub-doctor': 'A quick guide for managing your reservations and services as a sub doctor.',
    },
    sharedTips: [
      'If a save error appears, review required fields such as date, amount, and payment method.',
      'Use search and filters to narrow the list instead of moving through many pages.',
      'Important reservation changes appear in the activity log inside reservation details.',
    ],
    doctorTips: [
      'Creating a future reservation from reservation details automatically uses the same client and doctor.',
      'Completing a reservation is the right place to add diagnosis, treatment, and files.',
    ],
    assistantTips: [
      'Confirming reservations and checking clients in helps the doctor follow the queue accurately.',
      'When adding a service to a reservation, confirm whether it needs an invoice before saving.',
    ],
    sections: {
      doctor: [
        {
          icon: 'UsersIcon',
          title: 'Client Management',
          steps: [
            'Open Clients from the side menu.',
            'Add a new client or open an existing client profile.',
            'Review the phone and WhatsApp numbers because reminder messages depend on them.',
          ],
        },
        {
          icon: 'ClipboardIcon',
          title: 'Reservations',
          steps: [
            'Open My Reservations to follow today reservations.',
            'From reservation details, you can create a future reservation for the same client.',
            'Use Complete Reservation to record diagnosis, treatment, and additional requests.',
          ],
        },
        {
          icon: 'ClockIcon',
          title: 'Schedule',
          steps: [
            'Open Schedule to set working days and hours.',
            'Add vacations or recurring unavailable days.',
            'The system blocks reservations outside working hours or in reserved slots.',
          ],
        },
        {
          icon: 'UserPlusIcon',
          title: 'Team',
          steps: [
            'Add assistants from the Assistants page.',
            'Add sub doctors from the Sub Doctors page according to package limits.',
            'Review permissions from admin if a page does not appear for a team member.',
          ],
        },
        {
          icon: 'DollarSignIcon',
          title: 'Finance and Purchases',
          steps: [
            'Follow invoices and payments from Finance.',
            'Record expenses from Purchases.',
            'Use Reports to review income and reservation summaries.',
          ],
        },
      ],
      assistant: [
        {
          icon: 'UsersIcon',
          title: 'Clients',
          steps: [
            'Open Clients to add a new client or update client data.',
            'Confirm the phone and WhatsApp numbers before creating a reservation.',
            'Use search to find clients quickly.',
          ],
        },
        {
          icon: 'CalendarIcon',
          title: 'Create Reservation',
          steps: [
            'Open Reservations, then choose a new appointment reservation.',
            'Select the client, doctor, date, and available time.',
            'Enter amount, paid amount, payment method, then save the reservation.',
          ],
        },
        {
          icon: 'ListIcon',
          title: 'Waiting List',
          steps: [
            'Use Check In when the client arrives.',
            'You can arrange the waiting list by entry priority.',
            'Use Cancel Check In if the client was checked in by mistake.',
          ],
        },
        {
          icon: 'DollarSignIcon',
          title: 'Finance',
          steps: [
            'Review invoices and payments from Finance.',
            'Record extra payments from Transactions.',
            'Confirm the payment method before saving any amount.',
          ],
        },
      ],
      'sub-doctor': [
        {
          icon: 'ClipboardIcon',
          title: 'My Reservations',
          steps: [
            'Open My Reservations to follow clients assigned to you.',
            'Open reservation details to review client data and the activity log.',
            'You can create a future reservation for the same client from reservation details.',
          ],
        },
        {
          icon: 'CheckCircleIcon',
          title: 'Complete Reservation',
          steps: [
            'Use Complete Reservation when the examination is finished.',
            'Record diagnosis, treatment, and current or next procedures.',
            'Attach required files when available.',
          ],
        },
        {
          icon: 'GridIcon',
          title: 'Services',
          steps: [
            'Review available services from the Services page.',
            'Add an extra service to the reservation when needed.',
            'Choose whether the service has an invoice before saving.',
          ],
        },
      ],
    },
  },
}

export default {
  components: {
    BAlert,
    BBadge,
    BCard,
    BCardBody,
    BCol,
    BRow,
  },
  computed: {
    user() {
      return JSON.parse(localStorage.getItem('user') || 'null') || {}
    },
    role() {
      return this.user.role || 'doctor'
    },
    localeKey() {
      return this.$i18n.locale === 'ar' ? 'ar' : 'en'
    },
    content() {
      return helpContent[this.localeKey]
    },
    isRTL() {
      return this.localeKey === 'ar'
    },
    pageDirection() {
      return this.isRTL ? 'rtl' : 'ltr'
    },
    roleKey() {
      if (this.role === 'assistant') return 'assistant'
      if (this.role === 'sub-doctor') return 'sub-doctor'
      return 'doctor'
    },
    roleLabel() {
      return this.content.roles[this.roleKey]
    },
    pageTitle() {
      return this.localeKey === 'ar'
        ? `${this.content.titlePrefix} ${this.roleLabel}`
        : `${this.content.titlePrefix} ${this.roleLabel}`
    },
    pageIntro() {
      return this.content.intros[this.roleKey]
    },
    sections() {
      return this.content.sections[this.roleKey]
    },
    tips() {
      const roleTips = this.roleKey === 'assistant'
        ? this.content.assistantTips
        : this.content.doctorTips

      return [
        ...roleTips,
        ...this.content.sharedTips,
      ]
    },
  },
}
</script>

<style scoped>
.help-page[dir='rtl'] .help-steps {
  padding-right: 0;
  padding-left: 0;
  list-style: none;
}

.help-page[dir='rtl'] .help-step-item {
  direction: ltr;
  display: flex;
  flex-direction: row-reverse;
  justify-content: flex-end;
  text-align: right;
}

.help-page[dir='rtl'] .help-step-number {
  flex: 0 0 auto;
  margin-left: 0.5rem;
}

.help-page[dir='rtl'] .help-step-text {
  direction: rtl;
  text-align: right;
}

.help-page[dir='ltr'] .help-steps {
  padding-left: 1rem;
  padding-right: 0;
  list-style: none;
}

.help-page[dir='ltr'] .help-step-item {
  direction: ltr;
  display: flex;
  justify-content: flex-start;
  text-align: left;
}

.help-page[dir='ltr'] .help-step-number {
  flex: 0 0 auto;
  margin-right: 0.5rem;
}

.help-step-text {
  min-width: 0;
}
</style>

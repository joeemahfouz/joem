/* ==========================================================================
   Long-form page content (Size guide / Delivery & payment / Returns)
   Text adapted from the Customer Text Pack. Bracketed decisions are filled
   from CONFIG in site.js, so changing a fee or window there updates the copy.
   ========================================================================== */
const SIZE_ROWS = [
  ["35", "22.5", "2.5", "5"], ["36", "23.0", "3.5", "5.5"], ["37", "23.7", "4", "6.5"],
  ["38", "24.3", "5", "7.5"], ["39", "25.0", "6", "8"], ["40", "25.7", "6.5", "9"],
  ["41", "26.3", "7.5", "9.5"],
];

const CONTENT = {
  size: {
    en: () => `
      <h1>Size guide</h1>
      <p class="muted">Measure your foot in centimetres — it is the most reliable way to choose online.</p>
      <h2>How to measure your foot</h2>
      <ol class="steps">
        <li>Put a sheet of paper on the floor against a wall.</li>
        <li>Stand on it with your heel touching the wall.</li>
        <li>Mark the paper at the tip of your longest toe.</li>
        <li>Measure from the edge of the paper to the mark, in centimetres.</li>
      </ol>
      <div class="note">Measure both feet in the afternoon and use the larger measurement — feet swell during the day.</div>
      <h2>Find your size</h2>
      <table>
        <thead><tr><th>EU size</th><th>Foot length (cm)</th><th>UK (approx.)</th><th>US (approx.)</th></tr></thead>
        <tbody>${SIZE_ROWS.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join("")}</tbody>
      </table>
      <ul>
        <li>Between two sizes? Take the larger one, especially for closed shoes and boots.</li>
        <li>Pointed shoes usually feel about half a size smaller than round-toe shoes.</li>
        <li>Sandals and open styles are more forgiving; boots are less.</li>
      </ul>
      <div class="note">The centimetre measurement is the honest fit answer. UK and US equivalents are approximate and vary between brands — treat them as a hint, not a promise. Not sure? Send us your measurement in cm on WhatsApp and we'll tell you which size to take.</div>`,
    ar: () => `
      <h1>دليل القياسات</h1>
      <p class="muted">قياس طول القدم بالسنتيمتر هو الطريقة الأدقّ للشراء أونلاين.</p>
      <h2>كيف تقيسين قدمك</h2>
      <ol class="steps">
        <li>ضعي ورقة على الأرض ملاصقة للحائط.</li>
        <li>قفي عليها بحيث يلامس كعبك الحائط.</li>
        <li>ضعي علامة على الورقة عند طرف أطول إصبع.</li>
        <li>قيسي المسافة من حافة الورقة حتى العلامة بالسنتيمتر.</li>
      </ol>
      <div class="note">قيسي القدمين بعد الظهر واعتمدي القياس الأكبر — القدم تتمدّد خلال النهار.</div>
      <h2>جدول القياسات</h2>
      <table>
        <thead><tr><th>القياس الأوروبي</th><th>طول القدم (سم)</th><th>بريطاني (تقريبي)</th><th>أميركي (تقريبي)</th></tr></thead>
        <tbody>${SIZE_ROWS.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join("")}</tbody>
      </table>
      <ul>
        <li>بين قياسين؟ اختاري الأكبر، خاصة للأحذية المغلقة والبوت.</li>
        <li>الأحذية المدبّبة تبدو عادة أصغر بنصف قياس من المستديرة.</li>
        <li>الصنادل والموديلات المفتوحة أكثر مرونة، والبوت أقل.</li>
      </ul>
      <div class="note">قياس السنتيمتر هو المعيار الأصدق للمقاس. القياسات البريطانية والأميركية تقريبية وتختلف بين الماركات. غير متأكدة؟ أرسلي لنا قياسك بالسنتيمتر عبر واتساب ونخبرك بالقياس المناسب.</div>`,
  },

  delivery: {
    en: () => `
      <h1>Delivery &amp; payment</h1>
      <h2>Delivery</h2>
      <ul>
        <li>We deliver across Lebanon.</li>
        <li>Delivery fee: <strong>${money(CONFIG.deliveryFee)}</strong>, added at checkout.</li>
        <li>Beirut and suburbs: ${CONFIG.deliveryDays.beirut} working days. Other areas: ${CONFIG.deliveryDays.other} working days.</li>
        <li>We confirm every order by WhatsApp before we send it. If we cannot reach you within 24 hours, we hold your order for 48 hours and then release the items back to stock.</li>
      </ul>
      <h2>Payment</h2>
      <ul>
        <li><strong>Cash on delivery</strong> — pay the courier when your order arrives.</li>
        <li><strong>Whish or OMT</strong> — send the payment, give us the reference number, and we dispatch the same day.</li>
        <li>Prices are in ${CONFIG.currency.code}. The price you see at checkout is the price you pay, plus the delivery fee.</li>
      </ul>
      <h2>Before your order is sent</h2>
      <ul>
        <li>Please check your size against our <a class="link-inline" href="size-guide.html">size guide</a> before ordering.</li>
        <li>If an item turns out to be unavailable after you order, we tell you the same day and refund any payment in full.</li>
      </ul>
      <div class="note">Every order is confirmed by a real person on WhatsApp before the courier is booked — it's the surest way to get the right size to the right address.</div>`,
    ar: () => `
      <h1>التوصيل والدفع</h1>
      <h2>التوصيل</h2>
      <ul>
        <li>نوصّل إلى كل لبنان.</li>
        <li>أجرة التوصيل: <strong>${money(CONFIG.deliveryFee)}</strong>، تُضاف عند إتمام الطلب.</li>
        <li>بيروت وضواحيها: ${CONFIG.deliveryDays.beirut} يوم عمل. باقي المناطق: ${CONFIG.deliveryDays.other} أيام عمل.</li>
        <li>نؤكّد كل طلب عبر واتساب قبل إرساله. إذا لم نتمكّن من الوصول إليك خلال ٢٤ ساعة، نحتفظ بالطلب ٤٨ ساعة ثم تعود القطع إلى المخزون.</li>
      </ul>
      <h2>الدفع</h2>
      <ul>
        <li><strong>الدفع عند الاستلام</strong> — تدفعين للمندوب عند وصول الطلب.</li>
        <li><strong>Whish أو OMT</strong> — أرسلي المبلغ وزوّدينا برقم العملية، ونرسل الطلب في نفس اليوم.</li>
        <li>الأسعار بالـ${CONFIG.currency.code}. السعر الظاهر عند إتمام الطلب هو السعر المطلوب، مضافاً إليه أجرة التوصيل.</li>
      </ul>
      <h2>قبل إرسال طلبك</h2>
      <ul>
        <li>يرجى التأكّد من قياسك عبر <a class="link-inline" href="size-guide.html">دليل القياسات</a> قبل الطلب.</li>
        <li>إذا تبيّن أن القطعة غير متوفّرة بعد الطلب، نُعلمك في نفس اليوم ونعيد أي مبلغ مدفوع كاملاً.</li>
      </ul>
      <div class="note">يؤكّد كل طلب شخصٌ حقيقي عبر واتساب قبل حجز المندوب — أضمن طريقة لوصول القياس الصحيح إلى العنوان الصحيح.</div>`,
  },

  returns: {
    en: () => `
      <h1>Returns &amp; exchanges</h1>
      <p>You have <strong>${CONFIG.returnWindowDays} days</strong> from the day you receive your order to ask for an exchange or a return.</p>
      <ul>
        <li>Items must be unworn and in their original condition, with the box and any tags. Please try shoes on a carpet or rug — soles worn outside cannot be returned.</li>
        <li><strong>Exchanges:</strong> we are happy to exchange for another size or item. The delivery fee for the exchange is paid by the customer.</li>
        <li><strong>Change of mind:</strong> we give store credit for the value of the item. The original delivery fee is not refunded.</li>
        <li><strong>Faulty, damaged or wrong item:</strong> send us a photo on WhatsApp within 24 hours of delivery. We replace it and cover delivery both ways.</li>
        <li><strong>Sale items:</strong> exchange only, no refund.</li>
      </ul>
      <p>To start a return or exchange, message us on <a class="link-inline" href="https://wa.me/${CONFIG.whatsapp}" target="_blank" rel="noopener">WhatsApp</a> with your order number.</p>
      <div class="note">Store credit for change of mind; a cash refund only when the fault is ours.</div>`,
    ar: () => `
      <h1>الإرجاع والاستبدال</h1>
      <p>لديك <strong>${CONFIG.returnWindowDays} أيام</strong> من تاريخ استلام الطلب لطلب الاستبدال أو الإرجاع.</p>
      <ul>
        <li>يجب أن تكون القطعة غير مستعملة وبحالتها الأصلية مع العلبة والبطاقات. جرّبي الحذاء على سجادة — النعل الذي استُعمل في الخارج لا يُقبل إرجاعه.</li>
        <li><strong>الاستبدال:</strong> يسعدنا استبدال القطعة بقياس آخر أو بقطعة أخرى. أجرة توصيل الاستبدال على الزبونة.</li>
        <li><strong>تغيير الرأي:</strong> نمنح رصيداً في المحل بقيمة القطعة. أجرة التوصيل الأصلية غير قابلة للاسترداد.</li>
        <li><strong>قطعة معيبة أو تالفة أو مختلفة:</strong> أرسلي لنا صورة عبر واتساب خلال ٢٤ ساعة من الاستلام. نستبدلها ونتحمّل التوصيل ذهاباً وإياباً.</li>
        <li><strong>قطع التخفيضات:</strong> استبدال فقط، بدون استرداد.</li>
      </ul>
      <p>لبدء الإرجاع أو الاستبدال، راسلينا على <a class="link-inline" href="https://wa.me/${CONFIG.whatsapp}" target="_blank" rel="noopener">واتساب</a> مع رقم الطلب.</p>
      <div class="note">رصيد في المحل عند تغيير الرأي؛ واسترداد نقدي فقط عندما يكون الخطأ منّا.</div>`,
  },
};

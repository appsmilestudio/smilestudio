import { i as __toESM } from "../_runtime.mjs";
import { q as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as previewPathPrefix } from "./router-CS1aPv0b.mjs";
import { A as parseAmount, C as latestOnOrBefore, D as nextOpenDay, E as needsMorningPing, F as statusTone, I as sumVisit, L as useSmileStore, M as reminderText, N as slotAccent, O as nextStep, P as soles, R as waHref, S as isSunday, T as moneyGap, _ as fold, a as METHODS, b as formatTime, c as Pill, d as STATUS_LABEL, f as Sheet, g as doctorById, h as dayReport, i as Field, j as prettyPhone, k as occupiesSlot, l as QUICK_AMOUNTS, m as cn, n as DOCTORS, o as METHOD_LABEL, p as TREATMENTS, r as DayNav, s as MONTHS, t as Btn, u as SLOTS, v as formatDay, w as limaToday, x as inputClass, y as formatStamp } from "./ui-CLvcTPwU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BGevKf7A.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MORNING = SLOTS.filter((slot) => slot < "13:00");
var AFTERNOON = SLOTS.filter((slot) => slot >= "13:00");
function nameOf(patients, id) {
	return patients.find((patient) => patient.id === id)?.fullName ?? "Paciente";
}
function Board({ date, today, role, patients, visits, onOpenVisit, onCreate, onIntake, onMorning }) {
	const [forcedDate, setForcedDate] = (0, import_react.useState)(null);
	const forceSunday = forcedDate === date;
	const [doctorTab, setDoctorTab] = (0, import_react.useState)(role === "miguel" ? "miguel" : "judith");
	const dayVisits = visits.filter((visit) => visit.date === date);
	const doctors = role === "judith" ? DOCTORS.filter((doctor) => doctor.id === "judith") : role === "miguel" ? DOCTORS.filter((doctor) => doctor.id === "miguel") : DOCTORS;
	const pending = dayVisits.filter(needsMorningPing);
	const confirmed = dayVisits.filter((visit) => [
		"confirmada",
		"en_sala",
		"en_atencion",
		"atendida"
	].includes(visit.status) && visit.time).length;
	const requests = dayVisits.filter((visit) => !visit.time && (visit.status === "solicitud" || visit.status === "reprogramada" || visit.status === "no_show"));
	const closedSunday = isSunday(date) && dayVisits.length === 0 && !forceSunday;
	const showGrid = !closedSunday && (!isSunday(date) || forceSunday) && (date >= today || dayVisits.some(occupiesSlot) || forceSunday);
	const libro = dayVisits.filter((visit) => visit.source === "libro" && !occupiesSlot(visit));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "stat-grid grid grid-cols-2 gap-2 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Confirmadas",
						value: confirmed,
						tone: "bg-moss-soft text-moss"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Sin confirmar",
						value: pending.length,
						tone: "bg-alert-soft text-alert"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Por ubicar",
						value: requests.length,
						tone: "bg-gold-soft text-gold-deep"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "En agenda",
						value: dayVisits.filter(occupiesSlot).length,
						tone: "bg-paper text-ink"
					})
				]
			}),
			pending.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-line bg-paper px-4 py-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-medium",
						children: [
							"Faltan ",
							pending.length,
							" confirmaciones"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Sin el aviso de la mañana no se puede rearmar el horario del doctor."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							onClick: onMorning,
							children: "Avisar por WhatsApp"
						})
					})
				]
			}) : null,
			requests.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-medium",
					children: "Llegaron por WhatsApp"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-sm text-gold-deep",
					onClick: onIntake,
					children: "Nueva solicitud"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: requests.map((visit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onOpenVisit(visit.id),
					className: "row-hit w-full rounded-2xl border border-line bg-paper px-3 py-3 text-left shadow-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: nameOf(patients, visit.patientId)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
							tone: statusTone(visit.status),
							children: STATUS_LABEL[visit.status]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-1 block text-sm text-muted",
						children: [
							doctorById(visit.doctorId).short,
							" · ",
							visit.treatment
						]
					})]
				}) }, visit.id))
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-sm text-gold-deep",
					onClick: onIntake,
					children: "Anotar solicitud de WhatsApp"
				})
			}),
			closedSunday ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-line bg-paper px-4 py-8 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl",
						children: "Domingo sin atención"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-2 max-w-sm text-sm text-muted",
						children: "El consultorio atiende de lunes a sábado, de 10:00 a. m. a 12:00 p. m. y de 5:00 p. m. a 7:30 p. m."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							tone: "paper",
							onClick: () => setForcedDate(date),
							children: "Abrir un hueco de emergencia"
						})
					})
				]
			}) : null,
			showGrid ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				doctors.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-3 grid grid-cols-2 gap-2 md:hidden",
					children: doctors.map((doctor) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setDoctorTab(doctor.id),
						className: cn("h-11 rounded-full text-sm font-medium", doctorTab === doctor.id ? "bg-ink text-paper" : "border border-line bg-paper text-muted"),
						children: doctor.short
					}, doctor.id))
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("grid gap-4", doctors.length > 1 && "md:grid-cols-2"),
					children: doctors.map((doctor) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: cn(doctors.length > 1 && doctor.id !== doctorTab && "hidden md:block", "min-w-0"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
								className: "mb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-2xl leading-none",
									children: doctor.short
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm text-muted",
									children: [
										doctor.name,
										" · ",
										doctor.focus
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlotGroup, {
								label: "Mañana",
								slots: MORNING,
								doctorId: doctor.id,
								date,
								visits: dayVisits,
								patients,
								onOpenVisit,
								onCreate
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlotGroup, {
								label: "Tarde",
								slots: AFTERNOON,
								doctorId: doctor.id,
								date,
								visits: dayVisits,
								patients,
								onOpenVisit,
								onCreate
							})
						]
					}, doctor.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "Horario fijo cada 30 minutos. Toca un hueco libre para agendar."
				})
			] }) : null,
			libro.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Libro del día"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 mt-1 text-sm text-muted",
					children: "Así quedó registrado, como en el Excel."
				}),
				DOCTORS.map((doctor) => {
					const rows = libro.filter((visit) => visit.doctorId === doctor.id);
					if (!rows.length) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mb-1 text-sm font-medium text-gold-deep",
							children: doctor.short
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "overflow-hidden rounded-2xl border border-line bg-paper",
							children: rows.map((visit) => {
								const charge = chargeText(visit);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "border-b border-line last:border-b-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => onOpenVisit(visit.id),
										className: "row-hit w-full px-3 py-3 text-left",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-start justify-between gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-medium",
													children: nameOf(patients, visit.patientId)
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: cn("shrink-0 text-sm font-medium tabular-nums", charge.tone === "moss" && "text-moss", charge.tone === "alert" && "text-alert", charge.tone === "gold" && "text-gold-deep", charge.tone === "muted" && "text-muted"),
													children: charge.text
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-1 block text-sm text-muted",
												children: visit.treatment
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "mt-1 block text-xs text-muted",
												children: [visit.payments.length ? visit.payments.map((payment) => payment.method).filter((method, index, all) => all.indexOf(method) === index).join(" · ") : visit.noCharge ? "Sin cargo" : "Revisar monto", visit.monthTag ? ` · Mes ${visit.monthTag.toLowerCase()}` : ""]
											})
										]
									})
								}, visit.id);
							})
						})]
					}, doctor.id);
				})
			] }) : null
		]
	});
}
function Stat({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-2xl border border-line px-3 py-3 shadow-card", tone),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-3xl leading-none",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs",
			children: label
		})]
	});
}
function SlotGroup({ label, slots, doctorId, date, visits, patients, onOpenVisit, onCreate }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-2",
			children: slots.map((time) => {
				const visit = visits.find((item) => item.doctorId === doctorId && item.date === date && item.time === time && occupiesSlot(item));
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-stretch gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-16 shrink-0 pt-2 text-sm tabular-nums text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-medium text-ink",
							children: formatTime(time).replace(" a. m.", "").replace(" p. m.", "")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs",
							children: time < "13:00" ? "a. m." : "p. m."
						})]
					}), visit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onOpenVisit(visit.id),
						className: cn("slot-card min-w-0 flex-1 rounded-2xl border border-line border-l-4 bg-paper px-3 py-2 text-left shadow-card", slotAccent(visit.status)),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium leading-tight",
								children: nameOf(patients, visit.patientId)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
								tone: statusTone(visit.status),
								children: STATUS_LABEL[visit.status]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-sm text-muted",
							children: visit.treatment
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => onCreate(doctorId, time),
						className: "slot-card min-h-14 min-w-0 flex-1 rounded-2xl border border-dashed border-line bg-paper/50 px-3 text-left text-sm text-muted",
						children: "Libre"
					})]
				}, time);
			})
		})]
	});
}
function chargeText(visit) {
	const total = visit.payments.reduce((sum, payment) => sum + payment.amount, 0);
	if (total > 0) return {
		text: soles(total),
		tone: "moss"
	};
	if (visit.noCharge) return {
		text: "Sin cargo",
		tone: "muted"
	};
	if (visit.source === "libro") return {
		text: "Sin monto",
		tone: "gold"
	};
	if (visit.status === "atendida") return {
		text: "Falta cobro",
		tone: "alert"
	};
	return {
		text: "Sin cobro",
		tone: "muted"
	};
}
function Caja({ date, patients, visits, close, onOpenVisit }) {
	const setCashDraft = useSmileStore((state) => state.setCashDraft);
	const closeDay = useSmileStore((state) => state.closeDay);
	const reopenDay = useSmileStore((state) => state.reopenDay);
	const report = dayReport(visits, date);
	const gap = moneyGap(close?.cashCounted ?? null, report.byMethod.efectivo);
	const locked = Boolean(close?.closedAt);
	const [error, setError] = (0, import_react.useState)("");
	const quality = qualityLabel(report, close);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Efectivo, Yape, Plin y POS quedan separados. Un pago digital sin número de operación o sin comprobante no deja el día limpio."
			}),
			locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("rounded-2xl px-4 py-3", quality === "Día cuadrado" ? "bg-moss-soft text-moss" : "bg-alert-soft text-alert"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: quality
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: ["Cerrado ", close?.closedAt ? formatStamp(close.closedAt) : ""]
					}),
					close?.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm",
						children: close.note
					}) : null
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2",
				children: METHODS.map((method) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-line bg-paper px-3 py-3 shadow-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: METHOD_LABEL[method]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl tabular-nums",
						children: soles(report.byMethod[method])
					})]
				}, method))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: ["Total del día ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium text-ink tabular-nums",
					children: soles(report.total)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid gap-3 sm:grid-cols-2",
				children: DOCTORS.map((doctor) => {
					const bag = report.byDoctor[doctor.id];
					const total = METHODS.reduce((sum, method) => sum + bag[method], 0);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-2xl border border-line bg-paper px-4 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-xl",
								children: doctor.short
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 space-y-1 text-sm",
								children: METHODS.map((method) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted",
										children: METHOD_LABEL[method]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tabular-nums",
										children: soles(bag[method])
									})]
								}, method))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 flex justify-between border-t border-line pt-2 text-sm font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums",
									children: soles(total)
								})]
							})
						]
					}, doctor.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-line bg-paper px-4 py-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: "Conteo de efectivo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							"En sistema hay ",
							soles(report.byMethod.efectivo),
							". Cuenta lo que hay en caja."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Efectivo contado",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: inputClass,
								inputMode: "decimal",
								disabled: locked,
								value: close?.cashCounted ?? "",
								placeholder: "0",
								onChange: (event) => {
									const raw = event.target.value;
									setCashDraft(date, { cashCounted: raw.trim() === "" ? null : parseAmount(raw) });
								}
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-cream px-3 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "Diferencia"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cn("font-display text-3xl tabular-nums", gap == null ? "text-muted" : Math.abs(gap) < .01 ? "text-moss" : "text-alert"),
								children: gap == null ? "—" : soles(gap)
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Nota del cierre",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: "min-h-24 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm",
								disabled: locked,
								value: close?.note ?? "",
								placeholder: "Obligatoria si hay diferencia o faltan comprobantes",
								onChange: (event) => setCashDraft(date, { note: event.target.value })
							})
						})
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-alert",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							tone: "paper",
							onClick: () => reopenDay(date),
							children: "Reabrir día"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							onClick: () => {
								const message = closeDay(date);
								setError(message ?? "");
							},
							children: "Cerrar día"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IssueList, {
				title: "Sin comprobante",
				empty: "Todos los pagos digitales del día tienen número y evidencia.",
				rows: report.missingEvidence.map((item) => ({
					id: item.payment.id,
					visitId: item.visit.id,
					title: patientName$1(patients, item.visit.patientId),
					detail: `${METHOD_LABEL[item.payment.method]} ${soles(item.payment.amount)} · ${doctorById(item.visit.doctorId).short}`
				})),
				onOpen: onOpenVisit
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IssueList, {
				title: "Atenciones sin monto en el libro",
				empty: "No hay atenciones del Excel sin monto.",
				rows: report.sinMonto.map((visit) => ({
					id: visit.id,
					visitId: visit.id,
					title: patientName$1(patients, visit.patientId),
					detail: visit.treatment
				})),
				onOpen: onOpenVisit
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IssueList, {
				title: "Falta cobrar",
				empty: "No hay atenciones nuevas sin cobro.",
				rows: report.faltaCobro.map((visit) => ({
					id: visit.id,
					visitId: visit.id,
					title: patientName$1(patients, visit.patientId),
					detail: visit.treatment
				})),
				onOpen: onOpenVisit
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 font-display text-2xl",
				children: "Movimientos"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "overflow-hidden rounded-2xl border border-line bg-paper",
				children: report.visits.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "px-4 py-6 text-sm text-muted",
					children: "Este día todavía no tiene cobros."
				}) : report.visits.map((visit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "border-b border-line last:border-b-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onOpenVisit(visit.id),
						className: "row-hit w-full px-3 py-3 text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block font-medium",
								children: patientName$1(patients, visit.patientId)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mt-1 block text-sm text-muted",
								children: [
									doctorById(visit.doctorId).short,
									" · ",
									visit.treatment
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "shrink-0 text-sm font-medium tabular-nums",
								children: visit.payments.length ? soles(visit.payments.reduce((sum, payment) => sum + payment.amount, 0)) : "S/ 0"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayLine, { payments: visit.payments })]
					})
				}, visit.id))
			})] })
		]
	});
}
function PayLine({ payments }) {
	if (!payments.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "mt-1 block text-xs text-muted",
		children: payments.map((payment) => {
			const missing = payment.method !== "efectivo" && (!payment.hasEvidence || !payment.operation);
			return `${METHOD_LABEL[payment.method]} ${soles(payment.amount)}${missing ? " · falta evidencia" : ""}`;
		}).join(" · ")
	});
}
function IssueList({ title, empty, rows, onOpen }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
		className: "font-medium",
		children: [title, rows.length ? ` · ${rows.length}` : ""]
	}), rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-1 text-sm text-muted",
		children: empty
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-2 space-y-2",
		children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => onOpen(row.visitId),
			className: "w-full rounded-2xl border border-line bg-alert-soft px-3 py-3 text-left",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block font-medium text-alert",
				children: row.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 block text-sm text-alert",
				children: row.detail
			})]
		}) }, row.id))
	})] });
}
function patientName$1(patients, id) {
	return patients.find((patient) => patient.id === id)?.fullName ?? "Paciente";
}
function qualityLabel(report, close) {
	if (!close?.closedAt) return "";
	const gap = moneyGap(close.cashCounted, report.byMethod.efectivo) ?? 0;
	if (report.missingEvidence.length || report.faltaCobro.length) return "Cerrado con observaciones";
	if (Math.abs(gap) > .009) return "Cerrado con diferencia";
	return "Día cuadrado";
}
function Debts({ debts, patients, date, onOpenVisit }) {
	const collectDebt = useSmileStore((state) => state.collectDebt);
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const pending = debts.filter((debt) => debt.status === "pendiente");
	const total = pending.reduce((sum, debt) => sum + debt.amount, 0);
	const ordered = [...debts].sort((a, b) => {
		if (a.status !== b.status) return a.status === "pendiente" ? -1 : 1;
		return patientName(patients, a.patientId).localeCompare(patientName(patients, b.patientId), "es");
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-line bg-paper px-4 py-4 shadow-card",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Saldo por cobrar"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-4xl tabular-nums",
					children: soles(total)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [pending.length, " cuentas abiertas, tomadas de la hoja de deudores."]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-2",
			children: ordered.map((debt) => {
				const patient = patients.find((item) => item.id === debt.patientId);
				const open = openId === debt.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-2xl border border-line bg-paper px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: patient?.fullName ?? "Paciente"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [debt.concept, patient?.phone ? ` · ${prettyPhone(patient.phone)}` : ""]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium tabular-nums",
								children: soles(debt.amount)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: debt.status === "pendiente" ? "text-xs text-alert" : "text-xs text-moss",
								children: debt.status === "pendiente" ? "Pendiente" : "Pagado"
							})]
						})]
					}), debt.status === "pendiente" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: METHODS.map((method) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								tone: "paper",
								onClick: () => {
									const id = collectDebt(debt.id, method, date);
									setOpenId(null);
									if (id) onOpenVisit(id);
								},
								children: METHOD_LABEL[method]
							}, method))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							tone: "paper",
							onClick: () => setOpenId(debt.id),
							children: "Cobrar hoy"
						})
					}) : null]
				}, debt.id);
			})
		})]
	});
}
function patientName(patients, id) {
	return patients.find((patient) => patient.id === id)?.fullName ?? "";
}
function People({ patients, visits, debts, onOpen, onCreate }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const [onlyDebt, setOnlyDebt] = (0, import_react.useState)(false);
	const debtIds = (0, import_react.useMemo)(() => new Set(debts.filter((debt) => debt.status === "pendiente").map((debt) => debt.patientId)), [debts]);
	const last = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const visit of visits) {
			const prev = map.get(visit.patientId);
			if (!prev || visit.date > prev) map.set(visit.patientId, visit.date);
		}
		return map;
	}, [visits]);
	const needle = fold(query);
	const rows = patients.filter((patient) => {
		if (onlyDebt && !debtIds.has(patient.id)) return false;
		if (!needle) return true;
		return fold(patient.fullName).includes(needle) || patient.dni.includes(query.trim()) || patient.phone.includes(query.replace(/\D/g, ""));
	}).sort((a, b) => a.fullName.localeCompare(b.fullName, "es"));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 sm:flex-row",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: query,
				onChange: (event) => setQuery(event.target.value),
				placeholder: "Buscar nombre, DNI o celular",
				className: "h-11 w-full rounded-full border border-line bg-paper px-4 text-sm",
				"aria-label": "Buscar paciente"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				tone: "paper",
				onClick: onCreate,
				children: "Nuevo"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Filter, {
				on: false === onlyDebt,
				onClick: () => setOnlyDebt(false),
				children: "Todos"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Filter, {
				on: onlyDebt,
				onClick: () => setOnlyDebt(true),
				children: "Con deuda"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-3 text-sm text-muted",
			children: [rows.length, " pacientes"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-2 overflow-hidden rounded-2xl border border-line bg-paper",
			children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "px-4 py-6 text-sm text-muted",
				children: "Nadie coincide con esa búsqueda."
			}) : rows.map((patient) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "border-b border-line last:border-b-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onOpen(patient.id),
					className: "row-hit w-full px-3 py-3 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: patient.fullName
						}), debtIds.has(patient.id) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-medium text-alert",
							children: "Deuda"
						}) : null]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-1 block text-sm text-muted",
						children: [
							patient.phone ? prettyPhone(patient.phone) : "Sin celular",
							patient.dni ? ` · DNI ${patient.dni}` : "",
							last.get(patient.id) ? ` · último ${last.get(patient.id)}` : ""
						]
					})]
				})
			}, patient.id))
		})
	] });
}
function Filter({ on, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: on ? "h-11 rounded-full bg-ink px-4 text-sm text-paper" : "h-11 rounded-full border border-line bg-paper px-4 text-sm text-muted",
		children
	});
}
function confirmUrl(id) {
	if (typeof window === "undefined") return "";
	const prefix = previewPathPrefix(window.location.hostname, window.location.pathname) ?? "";
	return `${window.location.origin}${prefix}/c/${id}`;
}
function Panels({ panel, onClose, onOpenPatient, onOpenVisit }) {
	if (!panel) return null;
	if (panel.kind === "visit") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisitSheet, {
		id: panel.id,
		onClose,
		onOpenPatient
	}, panel.id);
	if (panel.kind === "patient") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PatientSheet, {
		id: panel.id,
		onClose,
		onOpenVisit
	}, panel.id);
	if (panel.kind === "new-patient") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PatientSheet, {
		id: null,
		onClose,
		onOpenVisit
	});
	if (panel.kind === "create") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateSheet, {
		date: panel.date,
		time: panel.time,
		doctorId: panel.doctorId,
		onClose,
		onOpen: onOpenVisit
	});
	if (panel.kind === "intake") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntakeSheet, {
		date: panel.date,
		onClose,
		onOpen: onOpenVisit
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MorningSheet, {
		date: panel.date,
		onClose,
		onOpen: onOpenVisit
	});
}
function VisitSheet({ id, onClose, onOpenPatient }) {
	const visit = useSmileStore((state) => state.visits.find((item) => item.id === id));
	const patient = useSmileStore((state) => state.patients.find((item) => item.id === visit?.patientId));
	const locked = useSmileStore((state) => Boolean(state.closes[visit?.date ?? ""]?.closedAt));
	const moveVisit = useSmileStore((state) => state.moveVisit);
	const patchVisit = useSmileStore((state) => state.patchVisit);
	const addPayment = useSmileStore((state) => state.addPayment);
	const removePayment = useSmileStore((state) => state.removePayment);
	const removeVisit = useSmileStore((state) => state.removeVisit);
	const [treatment, setTreatment] = (0, import_react.useState)(visit?.treatment ?? "");
	const [monthTag, setMonthTag] = (0, import_react.useState)(visit?.monthTag ?? "");
	const [note, setNote] = (0, import_react.useState)(visit?.note ?? "");
	const [noCharge, setNoCharge] = (0, import_react.useState)(visit?.noCharge ?? false);
	const [error, setError] = (0, import_react.useState)("");
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [askDelete, setAskDelete] = (0, import_react.useState)(false);
	const [method, setMethod] = (0, import_react.useState)("efectivo");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [operation, setOperation] = (0, import_react.useState)("");
	const [payNote, setPayNote] = (0, import_react.useState)("");
	const [seen, setSeen] = (0, import_react.useState)(false);
	const [evidence, setEvidence] = (0, import_react.useState)();
	if (!visit || !patient) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		title: "Cita",
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Esta cita ya no está en el libro."
		})
	});
	const doctor = doctorById(visit.doctorId);
	const step = nextStep(visit.status);
	const message = reminderText(patient, visit, confirmUrl(visit.id));
	const href = waHref(patient.phone, message);
	const apply = (patch) => {
		const result = moveVisit(visit.id, patch);
		setError(result.ok ? "" : result.reason);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		title: patient.fullName,
		subtitle: `${doctor.short} · ${formatDay(visit.date)}${visit.time ? ` · ${formatTime(visit.time)}` : ""}`,
		onClose,
		footer: step && !locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
			full: true,
			onClick: () => apply({ status: step.status }),
			children: step.label
		}) : null,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
							tone: statusTone(visit.status),
							children: STATUS_LABEL[visit.status]
						}),
						visit.monthTag ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
							tone: "gold",
							children: ["Mes ", visit.monthTag]
						}) : null,
						locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
							tone: "ink",
							children: "Día cerrado"
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: DOCTORS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: locked,
						onClick: () => apply({ doctorId: item.id }),
						className: item.id === visit.doctorId ? "h-11 rounded-full bg-ink px-4 text-sm text-paper" : "h-11 rounded-full border border-line px-4 text-sm",
						children: item.short
					}, item.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Estado",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: inputClass,
						disabled: locked,
						value: visit.status,
						onChange: (event) => apply({ status: event.target.value }),
						children: Object.keys(STATUS_LABEL).map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: status,
							children: STATUS_LABEL[status]
						}, status))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Fecha",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "date",
						className: inputClass,
						disabled: locked,
						value: visit.date,
						onChange: (event) => apply({ date: event.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Horario",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: inputClass,
						disabled: locked,
						value: visit.time ?? "",
						onChange: (event) => {
							const time = event.target.value;
							if (!time) {
								apply({
									time: null,
									status: visit.status === "agendada" ? "solicitud" : visit.status
								});
								return;
							}
							apply({
								time,
								status: visit.status === "solicitud" || visit.status === "reprogramada" ? "agendada" : visit.status
							});
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Sin hora"
						}), SLOTS.map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: slot,
							children: formatTime(slot)
						}, slot))]
					})
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-alert",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							tone: "moss",
							onClick: () => {
								if (visit.status === "agendada" || visit.status === "solicitud") apply({ status: "recordatorio" });
								window.open(href, "_blank", "noopener,noreferrer");
							},
							children: "WhatsApp"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-alert",
							children: "Este paciente no tiene celular."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							tone: "paper",
							onClick: () => {
								navigator.clipboard.writeText(message).then(() => setCopied(true)).catch(() => setCopied(false));
							},
							children: copied ? "Mensaje copiado" : "Copiar mensaje"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							tone: "paper",
							onClick: () => onOpenPatient(patient.id),
							children: "Ficha"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 rounded-2xl bg-cream p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Tratamiento",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: "min-h-20 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm",
								value: treatment,
								onChange: (event) => setTreatment(event.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: TREATMENTS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "rounded-full border border-line bg-paper px-3 py-2 text-xs",
								onClick: () => setTreatment(item),
								children: item
							}, item))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Mes de ortodoncia",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: inputClass,
								value: monthTag,
								onChange: (event) => setMonthTag(event.target.value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "No aplica"
								}), MONTHS.map((month) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: month }, month))]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Nota",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: "min-h-16 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm",
								value: note,
								onChange: (event) => setNote(event.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: noCharge,
								onChange: (event) => setNoCharge(event.target.checked)
							}), "Esta atención no se cobra"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							tone: "paper",
							onClick: () => patchVisit(visit.id, {
								treatment: treatment.trim() || visit.treatment,
								monthTag,
								note,
								noCharge
							}),
							children: "Guardar datos"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex items-baseline justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-2xl",
							children: "Cobro"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium tabular-nums",
							children: soles(sumVisit(visit))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: visit.payments.map((payment) => {
							const missing = payment.method !== "efectivo" && (!payment.hasEvidence || !payment.operation);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-2xl border border-line px-3 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-medium",
											children: [
												METHOD_LABEL[payment.method],
												" · ",
												soles(payment.amount)
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm text-muted",
											children: [payment.operation ? `Op. ${payment.operation}` : "Sin número de operación", payment.note ? ` · ${payment.note}` : ""]
										}),
										missing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-alert",
											children: "Falta evidencia para cuadrar."
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-moss",
											children: "Comprobante listo"
										})
									] }), !locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "text-sm text-alert",
										onClick: () => removePayment(visit.id, payment.id),
										children: "Quitar"
									}) : null]
								}), payment.evidence ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: payment.evidence,
									alt: "Comprobante",
									className: "mt-2 max-h-40 w-full rounded-xl object-cover"
								}) : null]
							}, payment.id);
						})
					}),
					!locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-3 space-y-3",
						onSubmit: (event) => {
							event.preventDefault();
							const value = parseAmount(amount);
							if (value <= 0) {
								setError("Escribe el monto cobrado.");
								return;
							}
							if (method !== "efectivo" && (!seen || !operation.trim())) {
								setError("Yape, Plin y POS necesitan el número de operación y marcar el comprobante.");
								return;
							}
							addPayment(visit.id, {
								method,
								amount: value,
								operation: operation.trim(),
								note: payNote.trim(),
								hasEvidence: method === "efectivo" || seen,
								evidence
							});
							setAmount("");
							setOperation("");
							setPayNote("");
							setSeen(false);
							setEvidence(void 0);
							setError("");
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-2 gap-2",
								children: METHODS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setMethod(item),
									className: item === method ? "h-11 rounded-full bg-ink text-sm text-paper" : "h-11 rounded-full border border-line text-sm",
									children: METHOD_LABEL[item]
								}, item))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Monto",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: inputClass,
									inputMode: "decimal",
									value: amount,
									onChange: (event) => setAmount(event.target.value),
									placeholder: "0"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: QUICK_AMOUNTS.map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "rounded-full bg-gold-soft px-3 py-2 text-sm text-gold-deep",
									onClick: () => setAmount(String(value)),
									children: value
								}, value))
							}),
							method !== "efectivo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Número de operación",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: inputClass,
										value: operation,
										onChange: (event) => setOperation(event.target.value)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: seen,
										onChange: (event) => setSeen(event.target.checked)
									}), "Vi el comprobante"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block text-sm text-muted",
									children: ["Foto del voucher", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "file",
										accept: "image/*",
										capture: "environment",
										className: "mt-1 block w-full text-sm",
										onChange: (event) => {
											const file = event.target.files?.[0];
											if (!file) return;
											shrinkImage(file).then((url) => {
												setSeen(true);
												if (url && url.length < 18e4) setEvidence(url);
											});
										}
									})]
								})
							] }) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Nota del pago",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: inputClass,
									value: payNote,
									onChange: (event) => setPayNote(event.target.value),
									placeholder: "A cuenta, mes, vuelto…"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								type: "submit",
								children: "Registrar cobro"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "El día está cerrado. Reábrelo desde Caja si hay que corregir."
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: askDelete ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						tone: "alert",
						onClick: () => {
							removeVisit(visit.id);
							onClose();
						},
						children: "Sí, quitar"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						tone: "paper",
						onClick: () => setAskDelete(false),
						children: "Cancelar"
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-sm text-muted",
					onClick: () => setAskDelete(true),
					children: "Quitar de la agenda"
				}) })
			]
		})
	});
}
function CreateSheet({ date, time, doctorId, onClose, onOpen }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingSheet, {
		title: "Nueva cita",
		subtitle: `${doctorById(doctorId).short} · ${formatDay(date)} · ${formatTime(time)}`,
		date,
		time,
		doctorId,
		source: "mostrador",
		status: "agendada",
		onClose,
		onOpen
	});
}
function IntakeSheet({ date, onClose, onOpen }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingSheet, {
		title: "Solicitud de WhatsApp",
		subtitle: formatDay(date),
		date,
		time: null,
		doctorId: "judith",
		source: "whatsapp",
		status: "solicitud",
		onClose,
		onOpen
	});
}
function BookingSheet({ title, subtitle, date, time, doctorId, source, status, onClose, onOpen }) {
	const patients = useSmileStore((state) => state.patients);
	const visits = useSmileStore((state) => state.visits);
	const createPatient = useSmileStore((state) => state.createPatient);
	const savePatient = useSmileStore((state) => state.savePatient);
	const addVisit = useSmileStore((state) => state.addVisit);
	const [doctor, setDoctor] = (0, import_react.useState)(doctorId);
	const [query, setQuery] = (0, import_react.useState)("");
	const [picked, setPicked] = (0, import_react.useState)(null);
	const [phone, setPhone] = (0, import_react.useState)("");
	const [dni, setDni] = (0, import_react.useState)("");
	const [age, setAge] = (0, import_react.useState)("");
	const [address, setAddress] = (0, import_react.useState)("");
	const [treatment, setTreatment] = (0, import_react.useState)(doctorId === "miguel" ? "Sesión de endodoncia" : "Consulta");
	const [error, setError] = (0, import_react.useState)("");
	const matches = query.trim().length < 2 ? [] : patients.filter((patient) => patient.fullName.toLowerCase().includes(query.trim().toLowerCase()) || patient.phone.includes(query.replace(/\D/g, ""))).slice(0, 5);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		title,
		subtitle,
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-3",
			onSubmit: (event) => {
				event.preventDefault();
				const name = (picked?.fullName || query).trim();
				if (name.length < 3) {
					setError("Escribe el nombre del paciente.");
					return;
				}
				if (time) {
					if (visits.some((visit) => visit.date === date && visit.time === time && visit.doctorId === doctor && occupiesSlot(visit))) {
						setError("Ese horario ya está ocupado.");
						return;
					}
				}
				const patientId = picked ? picked.id : createPatient({
					fullName: name,
					phone: phone.trim(),
					dni: dni.trim(),
					age: age.trim(),
					address: address.trim()
				});
				if (picked) savePatient({
					...picked,
					phone: phone.trim() || picked.phone,
					dni: dni.trim() || picked.dni,
					age: age.trim() || picked.age,
					address: address.trim() || picked.address
				});
				onOpen(addVisit({
					patientId,
					doctorId: doctor,
					date,
					time,
					treatment: treatment.trim() || "Consulta",
					status,
					payments: [],
					monthTag: "",
					note: "",
					source,
					noCharge: false
				}));
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2",
					children: DOCTORS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setDoctor(item.id),
						className: item.id === doctor ? "h-11 flex-1 rounded-full bg-ink text-sm text-paper" : "h-11 flex-1 rounded-full border border-line text-sm",
						children: item.short
					}, item.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Paciente",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: inputClass,
						value: picked ? picked.fullName : query,
						onChange: (event) => {
							setPicked(null);
							setQuery(event.target.value);
						},
						placeholder: "Apellidos y nombres"
					})
				}),
				!picked && matches.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "overflow-hidden rounded-xl border border-line",
					children: matches.map((patient) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "w-full px-3 py-2 text-left text-sm",
						onClick: () => {
							setPicked(patient);
							setPhone(patient.phone);
							setDni(patient.dni);
							setAge(patient.age);
							setAddress(patient.address);
						},
						children: [patient.fullName, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-muted",
							children: patient.phone ? prettyPhone(patient.phone) : "Sin celular"
						})]
					}) }, patient.id))
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Celular",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: inputClass,
							value: phone,
							onChange: (event) => setPhone(event.target.value)
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "DNI",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: inputClass,
							value: dni,
							onChange: (event) => setDni(event.target.value)
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Edad",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: inputClass,
							value: age,
							onChange: (event) => setAge(event.target.value)
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Dirección",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: inputClass,
							value: address,
							onChange: (event) => setAddress(event.target.value)
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Tratamiento",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: inputClass,
						value: treatment,
						onChange: (event) => setTreatment(event.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: TREATMENTS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "rounded-full border border-line px-3 py-2 text-xs",
						onClick: () => setTreatment(item),
						children: item
					}, item))
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-alert",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					type: "submit",
					full: true,
					children: "Guardar"
				})
			]
		})
	});
}
function PatientSheet({ id, onClose, onOpenVisit }) {
	const existing = useSmileStore((state) => state.patients.find((patient) => patient.id === id));
	const allVisits = useSmileStore((state) => state.visits);
	const allDebts = useSmileStore((state) => state.debts);
	const visits = allVisits.filter((visit) => visit.patientId === id);
	const debts = allDebts.filter((debt) => debt.patientId === id);
	const savePatient = useSmileStore((state) => state.savePatient);
	const createPatient = useSmileStore((state) => state.createPatient);
	const [fullName, setFullName] = (0, import_react.useState)(existing?.fullName ?? "");
	const [age, setAge] = (0, import_react.useState)(existing?.age ?? "");
	const [dni, setDni] = (0, import_react.useState)(existing?.dni ?? "");
	const [phone, setPhone] = (0, import_react.useState)(existing?.phone ?? "");
	const [address, setAddress] = (0, import_react.useState)(existing?.address ?? "");
	const [localId, setLocalId] = (0, import_react.useState)(id);
	const [saved, setSaved] = (0, import_react.useState)(false);
	const history = [...visits].sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : (b.time ?? "").localeCompare(a.time ?? ""));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
		title: id ? fullName || "Paciente" : "Nuevo paciente",
		subtitle: id ? "Ficha del libro" : "Se guarda en este dispositivo",
		onClose,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-3",
				onSubmit: (event) => {
					event.preventDefault();
					if (fullName.trim().length < 3) return;
					if (existing) savePatient({
						...existing,
						fullName: fullName.trim(),
						age,
						dni,
						phone,
						address
					});
					else if (localId) savePatient({
						id: localId,
						fullName: fullName.trim(),
						age,
						dni,
						phone,
						address
					});
					else setLocalId(createPatient({
						fullName: fullName.trim(),
						age,
						dni,
						phone,
						address
					}));
					setSaved(true);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Apellidos y nombres",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: inputClass,
							value: fullName,
							onChange: (event) => setFullName(event.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Edad",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: inputClass,
								value: age,
								onChange: (event) => setAge(event.target.value)
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "DNI",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: inputClass,
								value: dni,
								onChange: (event) => setDni(event.target.value)
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Celular",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: inputClass,
							value: phone,
							onChange: (event) => setPhone(event.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Dirección",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: inputClass,
							value: address,
							onChange: (event) => setAddress(event.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						type: "submit",
						children: saved ? "Guardado" : "Guardar ficha"
					})
				]
			}),
			debts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-1 text-sm",
				children: debts.map((debt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: debt.status === "pendiente" ? "text-alert" : "text-moss",
					children: [
						debt.concept,
						": ",
						soles(debt.amount),
						" · ",
						debt.status
					]
				}, debt.id))
			}) : null,
			history.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 divide-y divide-line",
				children: history.map((visit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "w-full py-3 text-left",
					onClick: () => onOpenVisit(visit.id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex justify-between gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatDay(visit.date) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums",
							children: soles(sumVisit(visit))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "block text-sm text-muted",
						children: [
							doctorById(visit.doctorId).short,
							" · ",
							visit.treatment
						]
					})]
				}) }, visit.id))
			}) : null
		]
	});
}
function MorningSheet({ date, onClose, onOpen }) {
	const allVisits = useSmileStore((state) => state.visits);
	const patients = useSmileStore((state) => state.patients);
	const moveVisit = useSmileStore((state) => state.moveVisit);
	const pending = allVisits.filter((visit) => visit.date === date && needsMorningPing(visit)).sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		title: "Ronda de la mañana",
		subtitle: formatDay(date),
		onClose,
		children: pending.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Todas las citas con hora ya están confirmadas."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-3",
			children: pending.map((visit) => {
				const patient = patients.find((item) => item.id === visit.patientId);
				if (!patient) return null;
				const href = waHref(patient.phone, reminderText(patient, visit, confirmUrl(visit.id)));
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-2xl border border-line px-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "w-full text-left",
						onClick: () => onOpen(visit.id),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: patient.fullName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-1 block text-sm text-muted",
							children: [
								visit.time ? formatTime(visit.time) : "",
								" · ",
								doctorById(visit.doctorId).short,
								" · ",
								STATUS_LABEL[visit.status]
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: [href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							tone: "paper",
							onClick: () => {
								moveVisit(visit.id, { status: "recordatorio" });
								window.open(href, "_blank", "noopener,noreferrer");
							},
							children: "Avisar"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-alert",
							children: "Sin celular"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							onClick: () => moveVisit(visit.id, { status: "confirmada" }),
							children: "Ya confirmó"
						})]
					})]
				}, visit.id);
			})
		})
	});
}
async function shrinkImage(file) {
	try {
		const bitmap = await createImageBitmap(file);
		const scale = Math.min(1, 720 / Math.max(bitmap.width, bitmap.height));
		const canvas = document.createElement("canvas");
		canvas.width = Math.max(1, Math.round(bitmap.width * scale));
		canvas.height = Math.max(1, Math.round(bitmap.height * scale));
		const ctx = canvas.getContext("2d");
		if (!ctx) return null;
		ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
		bitmap.close();
		return canvas.toDataURL("image/jpeg", .68);
	} catch {
		return null;
	}
}
var TABS = [
	{
		id: "hoy",
		label: "Agenda",
		short: "Agenda"
	},
	{
		id: "pacientes",
		label: "Pacientes",
		short: "Pacientes"
	},
	{
		id: "caja",
		label: "Caja",
		short: "Caja"
	},
	{
		id: "deudas",
		label: "Deudas",
		short: "Deudas"
	}
];
var ROLES = [
	{
		id: "recepcion",
		label: "Recepción"
	},
	{
		id: "judith",
		label: "Dra. Judith"
	},
	{
		id: "miguel",
		label: "Dr. Miguel"
	},
	{
		id: "dueno",
		label: "Administración"
	}
];
function SmileApp() {
	const today = limaToday();
	const patients = useSmileStore((state) => state.patients);
	const visits = useSmileStore((state) => state.visits);
	const debts = useSmileStore((state) => state.debts);
	const closes = useSmileStore((state) => state.closes);
	const role = useSmileStore((state) => state.role);
	const setRole = useSmileStore((state) => state.setRole);
	const resetLibro = useSmileStore((state) => state.resetLibro);
	const [tab, setTab] = (0, import_react.useState)("hoy");
	const [boardDate, setBoardDate] = (0, import_react.useState)(() => nextOpenDay(today));
	const [cajaDate, setCajaDate] = (0, import_react.useState)(() => latestOnOrBefore(useSmileStore.getState().visits.map((visit) => visit.date), today));
	const [panel, setPanel] = (0, import_react.useState)(null);
	const [askReset, setAskReset] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		useSmileStore.persist.rehydrate();
	}, []);
	const movingDate = tab === "caja" || tab === "deudas";
	const activeDate = movingDate ? cajaDate : boardDate;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-1 bg-gold",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-20 border-b border-line bg-cream/90 backdrop-blur-md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-6xl px-4 md:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 py-3 md:gap-5 md:py-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 flex-1 items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: "/clinic-mark.png",
									alt: "",
									className: "mark-in h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate font-display text-2xl leading-none text-ink sm:text-3xl",
										children: "Smile Studio"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 hidden truncate text-sm text-muted sm:block",
										children: "Consultorio dental · Piura"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
								className: "hidden items-center gap-1 rounded-full border border-line bg-paper p-1 lg:flex",
								"aria-label": "Secciones",
								children: TABS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabButton, {
									active: tab === item.id,
									onClick: () => setTab(item.id),
									children: item.label
								}, item.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "sr-only",
								htmlFor: "rol",
								children: "Quién usa la app"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								id: "rol",
								className: "press h-11 max-w-40 shrink-0 rounded-full border border-line bg-paper px-3 text-sm shadow-card",
								value: role,
								onChange: (event) => setRole(event.target.value),
								children: ROLES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: item.id,
									children: item.label
								}, item.id))
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "grid grid-cols-4 gap-1 pb-3 lg:hidden",
						"aria-label": "Secciones",
						children: TABS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabButton, {
							active: tab === item.id,
							onClick: () => setTab(item.id),
							compact: true,
							children: item.short
						}, item.id))
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto w-full max-w-6xl flex-1 px-4 py-5 md:px-6 md:py-8",
				children: [tab !== "pacientes" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayNav, {
						date: activeDate,
						today,
						onChange: movingDate ? setCajaDate : setBoardDate
					})
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rise",
					children: [
						tab === "hoy" && isSunday(today) && boardDate === nextOpenDay(today) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mb-4 rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-muted shadow-card",
							children: [
								"Hoy es domingo. Esta es la agenda del ",
								formatDay(boardDate).toLowerCase(),
								" para avisar en la mañana."
							]
						}) : null,
						tab === "hoy" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Board, {
							date: boardDate,
							today,
							role,
							patients,
							visits,
							onOpenVisit: (id) => setPanel({
								kind: "visit",
								id
							}),
							onCreate: (doctorId, time) => setPanel({
								kind: "create",
								date: boardDate,
								time,
								doctorId
							}),
							onIntake: () => setPanel({
								kind: "intake",
								date: boardDate
							}),
							onMorning: () => setPanel({
								kind: "morning",
								date: boardDate
							})
						}) : null,
						tab === "pacientes" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(People, {
							patients,
							visits,
							debts,
							onOpen: (id) => setPanel({
								kind: "patient",
								id
							}),
							onCreate: () => setPanel({ kind: "new-patient" })
						}) : null,
						tab === "caja" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Caja, {
							date: cajaDate,
							patients,
							visits,
							close: closes[cajaDate],
							onOpenVisit: (id) => setPanel({
								kind: "visit",
								id
							})
						}) : null,
						tab === "deudas" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Debts, {
							debts,
							patients,
							date: today,
							onOpenVisit: (id) => setPanel({
								kind: "visit",
								id
							})
						}) : null
					]
				}, `${tab}-${tab === "pacientes" ? "people" : activeDate}`)]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "mt-4 border-t border-line bg-paper/70",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:grid-cols-3 md:px-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/clinic-mark.png",
								alt: "",
								className: "h-10 w-10 object-contain"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-xl leading-none",
									children: "Smile Studio"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted",
									children: "Dra. Judith Escobedo Arteaga"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "Dr. Miguel Oyola Bayona"
								})
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-wide text-gold-deep uppercase",
								children: "Horario"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm",
								children: "Lunes a sábado"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "10:00 a. m. – 12:00 p. m."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "5:00 p. m. – 7:30 p. m."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: "Domingo cerrado"
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-wide text-gold-deep uppercase",
								children: "Este dispositivo"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: "El libro de octubre 2026 ya está cargado. Lo que cambies se guarda aquí."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3",
								children: askReset ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
										tone: "alert",
										onClick: () => {
											resetLibro();
											setAskReset(false);
										},
										children: "Sí, restaurar"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
										tone: "paper",
										onClick: () => setAskReset(false),
										children: "Cancelar"
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-sm text-gold-deep",
									onClick: () => setAskReset(true),
									children: "Restaurar el libro de octubre"
								})
							})
						] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panels, {
				panel,
				onClose: () => setPanel(null),
				onOpenPatient: (id) => setPanel({
					kind: "patient",
					id
				}),
				onOpenVisit: (id) => setPanel({
					kind: "visit",
					id
				})
			})
		]
	});
}
function TabButton({ active, onClick, compact, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: cn("press h-11 rounded-full text-sm font-medium", compact ? "px-2" : "px-4", active ? "bg-ink text-paper shadow-card" : "text-muted hover:bg-cream hover:text-ink"),
		children
	});
}
var SplitComponent = SmileApp;
//#endregion
export { SplitComponent as component };
